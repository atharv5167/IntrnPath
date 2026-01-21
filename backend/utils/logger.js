// Winston Logger Configuration
const winston = require('winston');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` | ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Console output (always)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        // File output for errors
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // File output for all logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/rejections.log')
        })
    ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: req.user?.id || 'anonymous'
        };

        if (res.statusCode >= 400) {
            logger.warn('Request completed with error', logData);
        } else {
            logger.info('Request completed', logData);
        }
    });

    next();
};

module.exports = logger;
module.exports.requestLogger = requestLogger;
