// Authentication Routes
const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin, getSupabase, getSupabaseAdmin } = require('../config/supabase');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        // Check if Supabase is configured
        if (!getSupabase()) {
            return res.status(503).json({
                success: false,
                error: 'Service Unavailable',
                message: 'Database service is not configured. Please contact support.'
            });
        }

        const { email, password, name, year, branch, goal } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Email, password, and name are required.'
            });
        }

        // Register user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name } // Store name in user metadata
            }
        });

        if (authError) {
            logger.warn('Registration failed', { email, error: authError.message });

            // Check if error is due to user already existing
            let errorMessage = authError.message;
            if (authError.message && (
                authError.message.includes('already registered') ||
                authError.message.includes('already exists') ||
                authError.message.includes('User already registered')
            )) {
                errorMessage = 'An account with this email already exists. Please try logging in instead.';
            }

            return res.status(400).json({
                success: false,
                error: 'Registration Failed',
                message: errorMessage
            });
        }

        // Create user profile in database using admin client (bypasses RLS)
        // We need admin because the user isn't authenticated yet during registration
        const dbClient = supabaseAdmin || supabase;
        const { error: profileError } = await dbClient
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                name,
                email,
                year: year || null,
                branch: branch || null,
                goal: goal || null,
                onboarding_completed: false
            });

        if (profileError) {
            logger.error('Profile creation failed', { userId: authData.user.id, error: profileError.message });
            // User was created but profile failed - still return success but log the issue
        }

        logger.info('User registered successfully', { userId: authData.user.id, email });

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            data: {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    name
                },
                session: authData.session
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        // Check if Supabase is configured
        if (!getSupabase()) {
            return res.status(503).json({
                success: false,
                error: 'Service Unavailable',
                message: 'Database service is not configured. Please contact support.'
            });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Email and password are required.'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            logger.warn('Login failed', { email, error: error.message });
            return res.status(401).json({
                success: false,
                error: 'Login Failed',
                message: 'Invalid email or password.'
            });
        }

        // Defensive check for missing data
        if (!data || !data.user || !data.session) {
            logger.error('Login returned incomplete data', { email, hasData: !!data, hasUser: !!data?.user, hasSession: !!data?.session });
            return res.status(500).json({
                success: false,
                error: 'Authentication Error',
                message: 'Login succeeded but session data was incomplete. Please try again.'
            });
        }

        logger.info('User logged in', { userId: data.user.id, email });

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email
                },
                session: {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', authMiddleware, async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            logger.warn('Logout failed', { userId: req.user.id, error: error.message });
            return res.status(500).json({
                success: false,
                error: 'Logout Failed',
                message: error.message
            });
        }

        logger.info('User logged out', { userId: req.user.id });

        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Refresh token is required.'
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Token Refresh Failed',
                message: 'Invalid or expired refresh token.'
            });
        }

        // Defensive check for incomplete session data
        if (!data || !data.session) {
            return res.status(500).json({
                success: false,
                error: 'Session Error',
                message: 'Token refresh succeeded but session data was incomplete.'
            });
        }

        res.json({
            success: true,
            data: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        // Fetch user profile
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            logger.error('Failed to fetch profile', { userId: req.user.id, error: error.message });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    ...profile
                }
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', authLimiter, async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Email is required.'
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
        });

        if (error) {
            logger.warn('Password reset request failed', { email, error: error.message });
        }

        // Always return success to prevent email enumeration
        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/auth/delete-account
 * Delete user account
 */
router.delete('/delete-account', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Note: In production, you'd want to use supabaseAdmin here
        // For now, we'll just mark the profile as deleted
        const { error } = await supabase
            .from('user_profiles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            logger.error('Account deletion failed', { userId, error: error.message });
            return res.status(500).json({
                success: false,
                error: 'Deletion Failed',
                message: 'Failed to delete account. Please try again.'
            });
        }

        logger.info('Account marked for deletion', { userId });

        res.json({
            success: true,
            message: 'Account deletion initiated. Your data will be removed within 30 days.'
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
