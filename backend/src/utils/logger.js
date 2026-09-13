/**
 * Application Logger utility
 */

const logger = {
  info: (message, meta = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta ? meta : '');
  },
  error: (message, error = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error ? error : '');
  },
};

module.exports = logger;
