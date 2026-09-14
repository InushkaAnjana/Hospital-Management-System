const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Get All Departments
 * GET /api/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Calculate doctor count for each department
    const enriched = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          doctorCount,
        };
      })
    );

    return sendSuccess(res, 'Departments retrieved successfully', enriched);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Department by ID
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return next(ApiError.notFound('Department not found.'));
    }
    const doctors = await Doctor.find({ department: department._id });
    return sendSuccess(res, 'Department retrieved', { department, doctors });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Department
 * POST /api/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment, status } = req.body;

    if (!name || !code) {
      return next(ApiError.badRequest('Department name and unique code are required.'));
    }

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return next(ApiError.conflict(`Department code '${code}' is already in use.`));
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      headOfDepartment: headOfDepartment || 'To be assigned',
      status: status || 'Active',
    });

    return sendSuccess(res, 'Department created successfully', department, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Department
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!department) {
      return next(ApiError.notFound('Department not found.'));
    }
    return sendSuccess(res, 'Department updated successfully', department);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Department
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const doctorCount = await Doctor.countDocuments({ department: req.params.id });
    if (doctorCount > 0) {
      return next(
        ApiError.badRequest(`Cannot delete department with ${doctorCount} assigned doctors. Please reassign them first.`)
      );
    }

    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(ApiError.notFound('Department not found.'));
    }
    return sendSuccess(res, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
