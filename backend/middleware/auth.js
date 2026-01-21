// Authentication Middleware
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token from Supabase Auth
 * Attaches user data to req.user on success
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.warn('Invalid token attempt', {
                ip: req.ip,
                path: req.path,
                error: error?.message
            });

            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid or expired token. Please login again.'
            });
        }

        // Attach user to request object
        req.user = user;
        req.token = token;

        next();
    } catch (err) {
        logger.error('Auth middleware error', { error: err.message });
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Authentication failed. Please try again.'
        });
    }
};

/**
 * Optional auth - attaches user if token present, continues if not
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                req.user = user;
                req.token = token;
            }
        }

        next();
    } catch (err) {
        // Continue without auth on error
        next();
    }
};

module.exports = { authMiddleware, optionalAuth };
