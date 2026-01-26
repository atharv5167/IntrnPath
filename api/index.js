// Vercel Serverless Function Entry Point
// This wraps the Express app for Vercel's serverless deployment

// Only load dotenv in local development (Vercel injects env vars automatically)
if (!process.env.VERCEL) {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import middleware
const { apiLimiter } = require('../backend/middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('../backend/middleware/errorHandler');
const logger = require('../backend/utils/logger');
const { requestLogger } = require('../backend/utils/logger');

// Import routes
const authRoutes = require('../backend/routes/auth');
const userRoutes = require('../backend/routes/users');
const skillRoutes = require('../backend/routes/skills');
const progressRoutes = require('../backend/routes/progress');
const linkRoutes = require('../backend/routes/links');
const projectRoutes = require('../backend/routes/projects');
const analyticsRoutes = require('../backend/routes/analytics');
const paymentRoutes = require('../backend/routes/payments');
const roadmapRoutes = require('../backend/routes/roadmap');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ===========================================
// Security Middleware
// ===========================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: isProduction
        ? [process.env.FRONTEND_URL, 'https://intrn-path.vercel.app']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// ===========================================
// API Routes
// ===========================================

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check (no auth required)
app.get('/api/health', (req, res) => {
    // Import getSupabase for status check
    const { getSupabase, getSupabaseAdmin, getInitError } = require('../backend/config/supabase');

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        envCheck: {
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
            isVercel: !!process.env.VERCEL,
            supabaseClientReady: !!getSupabase(),
            supabaseAdminReady: !!getSupabaseAdmin(),
            initError: getInitError() || null
        }
    });
});

// API route handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/roadmap', roadmapRoutes);

// ===========================================
// Error Handling
// ===========================================

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Export for Vercel
module.exports = app;
