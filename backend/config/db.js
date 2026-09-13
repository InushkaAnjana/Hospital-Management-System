const mongoose = require('mongoose');
const env = require('./env');

/**
 * Configure Mongoose Connection Events
 */
mongoose.connection.on('connected', () => {
  console.log(`[Database] MongoDB Atlas Connected: ${mongoose.connection.host}`);
  console.log(`[Database] Active Database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Warning] MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB connection re-established.');
});

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongo.uri, env.mongo.options);
    return conn;
  } catch (error) {
    console.error(`[Database Fatal] Initial connection failed: ${error.message}`);
    if (env.isProduction) {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Gracefully close MongoDB connection
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed gracefully.');
  } catch (error) {
    console.error(`[Database Error] Error during disconnection: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
