const { errorResponse } = require('../utils/apiResponse');

/**
 * 404 Route Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route Not Found: ${req.method} ${req.originalUrl}`, null, 404);
};

module.exports = notFoundHandler;
