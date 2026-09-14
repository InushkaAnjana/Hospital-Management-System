const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate next Doctor code (e.g. DOC-101)
 */
const generateDoctorCode = async () => {
  const count = await Doctor.countDocuments();
  return `DOC-${101 + count}`;
};

/**
 * Get All Doctors
 * GET /api/doctors
 */
const getDoctors = async (req, res, next) => {
  try {
    const { department, specialization, status, day, search } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (specialization) filter.specialization = specialization;
    if (status) filter.status = status;
    if (day) filter.availableDays = day;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { doctorCode: regex },
        { specialization: regex },
      ];
    }

    const doctors = await Doctor.find(filter)
      .populate('department', 'name code')
      .sort({ name: 1 });

    return sendSuccess(res, 'Doctors retrieved successfully', doctors);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Doctor by ID
 * GET /api/doctors/:id
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('department');
    if (!doctor) {
      return next(ApiError.notFound('Doctor profile not found.'));
    }
    return sendSuccess(res, 'Doctor profile retrieved', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * Create New Doctor
 * POST /api/doctors
 */
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      specialization,
      department,
      qualifications,
      experienceYears,
      consultationFee,
      phone,
      email,
      availableDays,
      timeSlots,
      status,
    } = req.body;

    if (!name || !specialization || !department || consultationFee === undefined) {
      return next(ApiError.badRequest('Doctor name, specialization, department, and consultation fee are required.'));
    }

    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return next(ApiError.badRequest('Assigned department does not exist.'));
    }

    const doctorCode = await generateDoctorCode();

    const doctor = await Doctor.create({
      doctorCode,
      name,
      specialization,
      department,
      qualifications: qualifications || 'MBBS, MD',
      experienceYears: Number(experienceYears) || 5,
      consultationFee: Number(consultationFee),
      phone: phone || '',
      email: email || '',
      availableDays: availableDays && availableDays.length > 0
        ? availableDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: timeSlots && timeSlots.length > 0
        ? timeSlots
        : [
            { startTime: '09:00 AM', endTime: '12:00 PM', maxPatients: 10 },
            { startTime: '02:00 PM', endTime: '05:00 PM', maxPatients: 10 },
          ],
      status: status || 'Available',
    });

    const populated = await Doctor.findById(doctor._id).populate('department', 'name code');
    return sendSuccess(res, 'Doctor registered successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Doctor
 * PUT /api/doctors/:id
 */
const updateDoctor = async (req, res, next) => {
  try {
    if (req.body.department) {
      const deptExists = await Department.findById(req.body.department);
      if (!deptExists) {
        return next(ApiError.badRequest('Assigned department does not exist.'));
      }
    }

    const updated = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!updated) {
      return next(ApiError.notFound('Doctor profile not found to update.'));
    }

    return sendSuccess(res, 'Doctor profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Doctor
 * DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(ApiError.notFound('Doctor profile not found to delete.'));
    }
    return sendSuccess(res, 'Doctor profile deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Doctor Schedule & Available Slots
 * GET /api/doctors/:id/schedule
 */
const getDoctorSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('name specialization availableDays timeSlots status');
    if (!doctor) {
      return next(ApiError.notFound('Doctor not found.'));
    }
    return sendSuccess(res, 'Doctor schedule retrieved', doctor);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSchedule,
};
