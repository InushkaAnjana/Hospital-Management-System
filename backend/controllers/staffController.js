const Staff = require('../models/Staff');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { logActivity } = require('../utils/auditLogger');

/**
 * Generate Employee Code (e.g. EMP-1001)
 */
const generateEmployeeCode = async () => {
  const count = await Staff.countDocuments();
  return `EMP-${1001 + count}`;
};

/**
 * Get Staff Directory
 * GET /api/staff
 */
const getStaff = async (req, res, next) => {
  try {
    const { role, department, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { employeeCode: regex }, { email: regex }, { designation: regex }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Staff.countDocuments(filter);

    const staffMembers = await Staff.find(filter)
      .populate('department', 'code name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(res, 'Staff members retrieved successfully', staffMembers, 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Staff Member
 * GET /api/staff/:id
 */
const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate('department');
    if (!staff) {
      return next(ApiError.notFound('Staff member not found.'));
    }
    return sendSuccess(res, 'Staff details retrieved', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * Create / Register Staff Member
 * POST /api/staff
 */
const createStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      designation,
      salary,
      shift,
      joiningDate,
      emergencyContact,
    } = req.body;

    if (!name || !email || !phone || !role) {
      return next(ApiError.badRequest('Name, Email, Phone, and Role are required.'));
    }

    const existingEmail = await Staff.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return next(ApiError.conflict('A staff member with this email already exists.'));
    }

    const employeeCode = await generateEmployeeCode();

    const staff = await Staff.create({
      employeeCode,
      name,
      email: email.toLowerCase(),
      phone,
      role,
      department: department || null,
      designation: designation || role,
      salary: Number(salary) || 0,
      shift: shift || 'Morning',
      joiningDate: joiningDate || new Date(),
      emergencyContact: emergencyContact || {},
      status: 'Active',
    });

    await logActivity(req, {
      action: 'CREATE',
      module: 'Staff',
      description: `Registered new staff member ${name} (${employeeCode}) as ${role}`,
    });

    return sendSuccess(res, 'Staff member registered successfully', staff, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Staff Member
 * PUT /api/staff/:id
 */
const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return next(ApiError.notFound('Staff member not found.'));
    }

    Object.assign(staff, req.body);
    await staff.save();

    return sendSuccess(res, 'Staff member updated successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Attendance
 * POST /api/staff/:id/attendance
 */
const markAttendance = async (req, res, next) => {
  try {
    const { date = new Date(), status = 'Present', checkIn, checkOut, notes } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return next(ApiError.notFound('Staff member not found.'));
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Remove existing record for the same day if any
    staff.attendance = staff.attendance.filter(
      (a) => new Date(a.date).setHours(0, 0, 0, 0) !== targetDate.getTime()
    );

    staff.attendance.push({
      date: targetDate,
      status,
      checkIn: checkIn || '09:00 AM',
      checkOut: checkOut || '05:00 PM',
      notes: notes || '',
    });

    await staff.save();
    return sendSuccess(res, 'Attendance logged successfully', staff.attendance);
  } catch (error) {
    next(error);
  }
};

/**
 * Apply Leave
 * POST /api/staff/:id/leave
 */
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return next(ApiError.notFound('Staff member not found.'));
    }

    if (!startDate || !endDate || !reason) {
      return next(ApiError.badRequest('Start Date, End Date, and Reason are required.'));
    }

    staff.leaveRecords.push({
      leaveType: leaveType || 'Casual',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending',
    });

    await staff.save();
    return sendSuccess(res, 'Leave application submitted', staff.leaveRecords);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Leave Status (Approve / Reject)
 * PATCH /api/staff/:staffId/leave/:leaveId/status
 */
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    const staff = await Staff.findById(req.params.staffId);

    if (!staff) {
      return next(ApiError.notFound('Staff member not found.'));
    }

    const leave = staff.leaveRecords.id(req.params.leaveId);
    if (!leave) {
      return next(ApiError.notFound('Leave record not found.'));
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || '';
    leave.approvedBy = req.user ? req.user._id : null;

    if (status === 'Approved') {
      staff.status = 'On Leave';
    } else if (staff.status === 'On Leave') {
      staff.status = 'Active';
    }

    await staff.save();

    await logActivity(req, {
      action: 'APPROVE_LEAVE',
      module: 'Staff',
      description: `${status} leave for ${staff.name} (${staff.employeeCode})`,
    });

    return sendSuccess(res, `Leave request ${status.toLowerCase()} successfully`, leave);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Staff Member
 * DELETE /api/staff/:id
 */
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return next(ApiError.notFound('Staff member not found.'));
    }
    return sendSuccess(res, 'Staff member record deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Staff Statistics
 * GET /api/staff/stats
 */
const getStaffStats = async (req, res, next) => {
  try {
    const [total, active, onLeave, roleCounts] = await Promise.all([
      Staff.countDocuments(),
      Staff.countDocuments({ status: 'Active' }),
      Staff.countDocuments({ status: 'On Leave' }),
      Staff.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    ]);

    return sendSuccess(res, 'Staff statistics retrieved', {
      total,
      active,
      onLeave,
      roleCounts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  markAttendance,
  applyLeave,
  updateLeaveStatus,
  deleteStaff,
  getStaffStats,
};
