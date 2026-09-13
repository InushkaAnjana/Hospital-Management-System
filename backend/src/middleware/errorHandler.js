const { errorResponse } = require('../utils/apiResponse');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, err, statusCode);
};

module.exports = errorHandler;
