/**
 * Standard API Response utility functions
 */

const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error && process.env.NODE_ENV !== 'production') {
    response.debug = error.message || error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
