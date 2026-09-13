const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Start Express Server
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[Server] HMS Backend Running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('[Server Error] Failed to initialize server:', error.message);
    process.exit(1);
  }
};

startServer();
