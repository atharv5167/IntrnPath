// Centralized Error Handler Middleware
const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
    }
}

/**
 * Not Found Handler (404)
 */
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
    next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 if no status code set
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error with context
    logger.error('Request error', {
        statusCode,
        message: err.message,
        path: req.path,
        method: req.method,
        userId: req.user?.id || 'anonymous',
        ip: req.ip,
        stack: isProduction ? undefined : err.stack,
        details: err.details
    });

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: statusCode >= 500 ? 'Internal Server Error' : err.message,
        message: isProduction && statusCode >= 500
            ? 'Something went wrong. Please try again later.'
            : err.message,
        ...(err.details && !isProduction && { details: err.details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { ApiError, notFoundHandler, errorHandler };
