const mongoose = require('mongoose');
const env = require('../config/env');

/**
 * Health check service providing system diagnostics
 */
const getSystemHealth = async (verbose = false) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const isDbConnected = dbState === 1;

  const healthData = {
    status: isDbConnected ? 'UP' : 'DEGRADED',
    system: 'Hospital Management System API',
    version: '1.0.0',
    environment: env.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatusMap[dbState] || 'Unknown',
      connected: isDbConnected,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    memoryUsageMb: {
      rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
      heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
    },
  };

  if (verbose) {
    healthData.diagnostics = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    };
  }

  return healthData;
};

module.exports = {
  getSystemHealth,
};
