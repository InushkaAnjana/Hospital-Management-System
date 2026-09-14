const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

/**
 * Record an audit log entry
 * @param {Object} req - Express request object (optional)
 * @param {Object} entry - { user, userName, userRole, action, module, description, details }
 */
const logActivity = async (req, { action, module: mod, description, details = {} }) => {
  try {
    const user = req?.user;
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';

    await AuditLog.create({
      user: user?._id || null,
      userName: user ? `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() || user.username || user.email : 'System',
      userRole: user?.role || 'System',
      action,
      module: mod,
      description,
      ipAddress,
      details,
    });
  } catch (err) {
    logger.error(`Failed to write audit log: ${err.message}`);
  }
};

module.exports = { logActivity };
