/**
 * Standardized API Response Utilities
 */

const sendSuccess = (res, message = 'Success', data = null, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null, stack = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors && (Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0)) {
    response.errors = errors;
  }

  if (stack && process.env.NODE_ENV !== 'production') {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  // Backwards compatibility aliases
  successResponse: sendSuccess,
  errorResponse: (res, message, err, statusCode = 500) =>
    sendError(res, message, statusCode, err?.errors || null, err?.stack || null),
};
