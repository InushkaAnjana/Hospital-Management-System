const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

const app = express();

// 1. Security & CORS Configuration
app.use(cors(corsOptions));

// 2. Request Body Parsers (with size limits)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Request Logging (Development Environment)
if (env.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// 4. Base Service Ping
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CarePulse Hospital Management System (HMS) API',
    version: '1.0.0',
    documentation: '/api/docs (coming soon)',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// 5. Mount API Routes
app.use('/api', routes);

// 6. 404 Route Not Found Handler
app.use(notFoundHandler);

// 7. Centralized Error Handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
