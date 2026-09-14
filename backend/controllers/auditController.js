const AuditLog = require('../models/AuditLog');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Get Audit Logs
 * GET /api/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { module: mod, action, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (mod) filter.module = mod;
    if (action) filter.action = action;

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userRole: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(res, 'Audit logs retrieved successfully', logs, 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
