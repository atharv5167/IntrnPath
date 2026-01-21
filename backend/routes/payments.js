// Payment Routes (Razorpay)
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { razorpay } = require('../config/razorpay');
const { authMiddleware } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

// Subscription Plans
const PLANS = {
    free: { name: 'Free', price: 0, features: ['Basic roadmap', 'Limited tracking'] },
    pro: { name: 'Pro', price: 49900, features: ['Full roadmap', 'Unlimited tracking', 'Analytics', 'Priority support'] }, // ₹499
    premium: { name: 'Premium', price: 99900, features: ['Everything in Pro', 'Personal mentorship', 'Job referrals'] } // ₹999
};

/**
 * GET /api/payments/plans
 * Get available subscription plans
 */
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        data: Object.entries(PLANS).map(([id, plan]) => ({
            id,
            name: plan.name,
            price: plan.price,
            price_display: plan.price === 0 ? 'Free' : `₹${plan.price / 100}`,
            features: plan.features
        }))
    });
});

/**
 * POST /api/payments/create-order
 * Create Razorpay order for subscription
 */
router.post('/create-order', authMiddleware, paymentLimiter, async (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                error: 'Service Unavailable',
                message: 'Payment service is not configured.'
            });
        }

        const { plan_id } = req.body;

        if (!plan_id || !PLANS[plan_id]) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Invalid plan selected.'
            });
        }

        if (plan_id === 'free') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Free plan does not require payment.'
            });
        }

        const plan = PLANS[plan_id];
        const receipt = `rcpt_${req.user.id.substring(0, 8)}_${Date.now()}`;

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: plan.price, // Amount in paise
            currency: 'INR',
            receipt,
            notes: {
                user_id: req.user.id,
                plan_id,
                user_email: req.user.email
            }
        });

        logger.info('Payment order created', {
            userId: req.user.id,
            orderId: order.id,
            planId: plan_id,
            amount: plan.price
        });

        res.json({
            success: true,
            data: {
                order_id: order.id,
                amount: order.amount,
                currency: order.currency,
                plan: plan.name,
                key_id: process.env.RAZORPAY_KEY_ID // Only key_id is safe to expose
            }
        });
    } catch (err) {
        logger.error('Failed to create payment order', {
            userId: req.user.id,
            error: err.message
        });
        next(err);
    }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature
 */
router.post('/verify', authMiddleware, async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Missing payment verification data.'
            });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            logger.warn('Payment signature verification failed', {
                userId: req.user.id,
                orderId: razorpay_order_id
            });
            return res.status(400).json({
                success: false,
                error: 'Verification Failed',
                message: 'Payment signature verification failed.'
            });
        }

        // Get payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Save payment to history
        await supabase.from('payment_history').insert({
            user_id: req.user.id,
            razorpay_order_id,
            razorpay_payment_id,
            amount: payment.amount,
            status: 'success',
            receipt: payment.notes?.receipt
        });

        // Update subscription
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription

        await supabase.from('subscriptions').upsert({
            user_id: req.user.id,
            plan: plan_id || 'pro',
            status: 'active',
            razorpay_customer_id: payment.customer_id,
            current_period_end: periodEnd.toISOString(),
            amount_paid: payment.amount
        }, { onConflict: 'user_id' });

        // Update user profile
        await supabase
            .from('user_profiles')
            .update({ is_pro: true })
            .eq('id', req.user.id);

        logger.info('Payment verified successfully', {
            userId: req.user.id,
            paymentId: razorpay_payment_id,
            amount: payment.amount
        });

        res.json({
            success: true,
            message: 'Payment successful! Your subscription is now active.',
            data: {
                plan: plan_id || 'pro',
                valid_until: periodEnd.toISOString()
            }
        });
    } catch (err) {
        logger.error('Payment verification error', {
            userId: req.user.id,
            error: err.message
        });
        next(err);
    }
});

/**
 * GET /api/payments/subscription
 * Get current subscription status
 */
router.get('/subscription', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({
            success: true,
            data: data || {
                plan: 'free',
                status: 'active',
                current_period_end: null
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/payments/cancel
 * Cancel subscription
 */
router.post('/cancel', authMiddleware, async (req, res, next) => {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString()
            })
            .eq('user_id', req.user.id);

        if (error) throw error;

        // Update user profile
        await supabase
            .from('user_profiles')
            .update({ is_pro: false })
            .eq('id', req.user.id);

        logger.info('Subscription cancelled', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Subscription cancelled. You will retain access until the end of your billing period.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/payments/history
 * Get payment history
 */
router.get('/history', authMiddleware, async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('payment_history')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: data || []
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler (no auth - verified via signature)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            return res.status(400).json({ error: 'Missing signature' });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(req.body)
            .digest('hex');

        if (expectedSignature !== signature) {
            logger.warn('Webhook signature verification failed');
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const event = JSON.parse(req.body);
        logger.info('Webhook received', { event: event.event });

        // Handle different webhook events
        switch (event.event) {
            case 'payment.captured':
                // Payment successful - already handled in verify endpoint
                break;

            case 'payment.failed':
                // Log failed payment
                await supabase.from('payment_history').insert({
                    user_id: event.payload.payment.entity.notes?.user_id,
                    razorpay_order_id: event.payload.payment.entity.order_id,
                    razorpay_payment_id: event.payload.payment.entity.id,
                    amount: event.payload.payment.entity.amount,
                    status: 'failed'
                });
                break;

            case 'subscription.cancelled':
                // Handle subscription cancellation from Razorpay side
                break;
        }

        res.json({ status: 'ok' });
    } catch (err) {
        logger.error('Webhook processing error', { error: err.message });
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
