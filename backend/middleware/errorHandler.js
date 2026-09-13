const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/apiResponse');
const env = require('../config/env');

/**
 * Convert known database or library errors into ApiError instances
 */
const normalizeError = (err) => {
  // If already an operational ApiError, return as-is
  if (err instanceof ApiError) {
    return err;
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid format for field '${err.path}': ${err.value}`;
    return new ApiError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return new ApiError('Validation failed for submitted data', 400, errors);
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
    const message = `A record with ${duplicateField} '${duplicateValue}' already exists.`;
    return new ApiError(message, 409);
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    return new ApiError('Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return new ApiError('Authentication token has expired. Please login again.', 401);
  }

  // SyntaxError in incoming JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return new ApiError('Malformed JSON payload received', 400);
  }

  // Generic fallback
  const statusCode = err.statusCode || (err.status && !isNaN(err.status) ? err.status : 500);
  const message = err.message || 'An unexpected internal server error occurred';
  return new ApiError(message, statusCode, null, false, err.stack);
};

/**
 * Global Centralized Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  // In development, log the full error details to console
  if (env.isDevelopment) {
    console.error(`[Error Handler] ${req.method} ${req.originalUrl} (${error.statusCode}):`, error.message);
    if (!error.isOperational) {
      console.error(err.stack || error.stack);
    }
  }

  return sendError(
    res,
    error.message,
    error.statusCode,
    error.errors,
    env.isDevelopment ? error.stack : null
  );
};

module.exports = errorHandler;
