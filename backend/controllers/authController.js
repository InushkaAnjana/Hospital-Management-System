const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, USER_ROLES } = require('../models/User');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate JWT helper
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

/**
 * Login Controller
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(ApiError.badRequest('Please provide both email and password'));
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password credentials.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password credentials.'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('This account has been disabled.'));
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user);

    return sendSuccess(
      res,
      'Authentication successful',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department,
          lastLogin: user.lastLogin,
        },
      },
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Logged In User
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('department');
    return sendSuccess(res, 'User profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Logged out successfully. Please discard the client token.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Users (Admin only)
 * GET /api/auth/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).populate('department').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

/**
 * Register New User (Admin only)
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(ApiError.conflict(`A user with email ${email} already exists.`));
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Hospital@12345',
      role: role || 'Receptionist',
      phone,
      department: department || null,
    });

    return sendSuccess(res, 'User created successfully', user, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  logout,
  getUsers,
  registerUser,
};
