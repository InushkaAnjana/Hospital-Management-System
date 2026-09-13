const ApiError = require('../utils/ApiError');

/**
 * 404 Route Not Found Middleware
 * Forwards an ApiError.notFound to the centralized error handler
 */
const notFoundHandler = (req, res, next) => {
  const message = `Cannot ${req.method} ${req.originalUrl} — endpoint does not exist.`;
  next(ApiError.notFound(message));
};

module.exports = notFoundHandler;
