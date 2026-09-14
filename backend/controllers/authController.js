const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, USER_ROLES } = require('../models/User');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { logActivity } = require('../utils/auditLogger');

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

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return next(ApiError.unauthorized('Invalid email or password credentials.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(ApiError.unauthorized('Invalid email or password credentials.'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('This account has been disabled by the administrator.'));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);

    logActivity(req, {
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${user.name} logged in successfully`,
    });

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
    if (req.user) {
      logActivity(req, {
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'LOGOUT',
        module: 'AUTH',
        description: `User ${req.user.name} logged out`,
      });
    }
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
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status !== undefined && status !== '') {
      filter.isActive = status === 'active' || status === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const users = await User.find(filter)
      .populate('department', 'code name')
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    return sendSuccess(res, 'Users retrieved successfully', users, 200, {
      total: users.length,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register / Provision New User (Admin only)
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    if (!name || !email || !password) {
      return next(ApiError.badRequest('Name, email, and password are required.'));
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(ApiError.conflict(`A user account with email "${email}" already exists.`));
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Receptionist',
      phone: phone || '',
      department: department || null,
      isActive: true,
    });

    const populatedUser = await User.findById(user._id).populate('department', 'code name');

    logActivity(req, {
      action: 'USER_PROVISIONED',
      module: 'AUTH',
      description: `New user account created: ${user.name} (${user.email}) as role ${user.role}`,
    });

    return sendSuccess(res, `Account for ${user.name} provisioned successfully`, populatedUser, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Details (Admin only)
 * PUT /api/auth/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, phone, department, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(ApiError.notFound('User account not found.'));
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return next(ApiError.conflict(`Email "${email}" is already used by another account.`));
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department || null;
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    await user.save();
    const updated = await User.findById(user._id).populate('department', 'code name');

    logActivity(req, {
      action: 'USER_UPDATED',
      module: 'AUTH',
      description: `User account updated: ${user.name} (${user.email})`,
    });

    return sendSuccess(res, 'User account updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Active/Inactive Status (Admin only)
 * PUT /api/auth/users/:id/toggle-status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(ApiError.notFound('User account not found.'));
    }

    if (String(user._id) === String(req.user._id)) {
      return next(ApiError.badRequest('You cannot deactivate your own administrative account.'));
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    logActivity(req, {
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      module: 'AUTH',
      description: `Account for ${user.name} was ${user.isActive ? 'activated' : 'deactivated'}`,
    });

    return sendSuccess(
      res,
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      { id: user._id, isActive: user.isActive }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reset User Password (Admin only)
 * PUT /api/auth/users/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return next(ApiError.badRequest('Password must be at least 6 characters long.'));
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return next(ApiError.notFound('User account not found.'));
    }

    user.password = newPassword;
    await user.save();

    logActivity(req, {
      action: 'PASSWORD_RESET',
      module: 'AUTH',
      description: `Password was reset for user ${user.name} (${user.email}) by Admin`,
    });

    return sendSuccess(res, `Password for ${user.name} updated successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User Account (Admin only)
 * DELETE /api/auth/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(ApiError.notFound('User account not found.'));
    }

    if (String(user._id) === String(req.user._id)) {
      return next(ApiError.badRequest('You cannot delete your own administrative account.'));
    }

    await User.findByIdAndDelete(req.params.id);

    logActivity(req, {
      action: 'USER_DELETED',
      module: 'AUTH',
      description: `User account deleted: ${user.name} (${user.email})`,
    });

    return sendSuccess(res, `User account ${user.name} deleted successfully`);
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
  updateUser,
  toggleUserStatus,
  resetPassword,
  deleteUser,
};
