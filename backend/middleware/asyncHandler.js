/**
 * Async Handler Wrapper
 * Automatically catches rejected promises from async controller methods
 * and forwards them to Express next() error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
