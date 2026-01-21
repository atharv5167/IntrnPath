// Rate Limiting Middleware
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

// Stricter limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        success: false,
        error: 'Too Many Attempts',
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limit for payment endpoints
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 payment attempts per hour
    message: {
        success: false,
        error: 'Too Many Payment Attempts',
        message: 'Too many payment attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, paymentLimiter };
