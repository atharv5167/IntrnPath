// IntrnPath Backend Server
require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { requestLogger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const progressRoutes = require('./routes/progress');
const linkRoutes = require('./routes/links');
const projectRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');
const roadmapRoutes = require('./routes/roadmap');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Frontend directory path
const frontendPath = path.join(__dirname, '..', 'frontend');

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
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing - skip JSON parsing for webhook endpoint (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// ===========================================
// Static Files (Frontend)
// ===========================================
app.use(express.static(frontendPath));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

// ===========================================
// API Routes
// ===========================================

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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
// Frontend Routes (SPA-style)
// ===========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendPath, 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(frontendPath, 'register.html'));
});

app.get('/onboarding', (req, res) => {

  res.sendFile(path.join(frontendPath, 'onboarding.html'));
});

app.get('/roadmap-detail', (req, res) => {
  res.sendFile(path.join(frontendPath, 'roadmap-detail.html'));
});

// ===========================================
// Error Handling
// ===========================================

// 404 handler for API routes only
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Catch-all for client-side routing (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ===========================================
// Server Startup
// ===========================================
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Log configuration status
  if (!process.env.SUPABASE_URL) {
    logger.warn('Supabase not configured - database features disabled');
  }
  if (!process.env.RAZORPAY_KEY_ID) {
    logger.warn('Razorpay not configured - payment features disabled');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});

module.exports = app;
