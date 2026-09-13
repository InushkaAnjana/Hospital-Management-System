/**
 * Custom Operational API Error Class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, errors = null, isOperational = true, stack = '') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request', errors = null) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden: Access is denied') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static conflict(message = 'Resource conflict detected') {
    return new ApiError(message, 409);
  }

  static unprocessableEntity(message = 'Unprocessable Entity', errors = null) {
    return new ApiError(message, 422, errors);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500, null, false);
  }
}

module.exports = ApiError;
