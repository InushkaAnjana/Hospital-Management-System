// Load and validate environment configuration first
const env = require('./config/env');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

// Handle uncaught synchronous exceptions
process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception detected:', err.message);
  console.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. Establish MongoDB connection
    await connectDB();

    // 2. Start Express HTTP Server
    const server = app.listen(env.port, () => {
      console.log('====================================================');
      console.log(`[Server] HMS Backend listening on port ${env.port}`);
      console.log(`[Server] Active Environment: ${env.nodeEnv}`);
      console.log(`[Server] CORS Allowed Origins: ${env.cors.origin.join(', ')}`);
      console.log(`[Server] Health Endpoint: http://localhost:${env.port}/api/health`);
      console.log('====================================================');
    });

    // 3. Handle unhandled asynchronous promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Fatal Error] Unhandled Promise Rejection:', err.message);
      if (err.stack) console.error(err.stack);
      server.close(() => {
        disconnectDB().then(() => process.exit(1));
      });
    });

    // 4. Graceful termination handler
    const gracefulShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP connections closed.');
        await disconnectDB();
        console.log('[Server] Process exiting cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('[Server Error] Failed to initialize server:', error.message);
    process.exit(1);
  }
};

startServer();
