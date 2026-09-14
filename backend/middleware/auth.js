const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Authenticate JWT Middleware
 * Extracts and verifies Bearer token, attaches active user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication token missing or invalid. Please login.'));
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwt.secret);

    // Find active user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(ApiError.unauthorized('The user belonging to this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact an Administrator.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid authentication token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired. Please log in again.'));
    }
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles Allowed roles for this route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User must be authenticated to check permissions.'));
    }

    // If Administrator, grant access to everything
    if (req.user.role === 'Administrator') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' does not have sufficient permissions.`
        )
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
