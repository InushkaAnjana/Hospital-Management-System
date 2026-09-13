const mongoose = require('mongoose');

/**
 * Health check service providing system diagnostics
 */
const getSystemHealth = async () => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  return {
    status: 'UP',
    system: 'Hospital Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatusMap[dbState] || 'Unknown',
      connected: dbState === 1,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    memoryUsageMb: {
      rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
      heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    },
  };
};

module.exports = {
  getSystemHealth,
};
