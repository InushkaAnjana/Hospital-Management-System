const Admission = require('../models/Admission');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { logActivity } = require('../utils/auditLogger');

/**
 * Generate Admission Number (e.g. ADM-2026-0001)
 */
const generateAdmissionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Admission.countDocuments();
  return `ADM-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get All Admissions
 * GET /api/admissions
 */
const getAdmissions = async (req, res, next) => {
  try {
    const { patient, doctor, ward, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (ward) filter.ward = ward;
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ admissionNumber: regex }, { roomNumber: regex }, { bedNumber: regex }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Admission.countDocuments(filter);

    const admissions = await Admission.find(filter)
      .populate('patient', 'patientId firstName lastName phone age gender bloodGroup emergencyContact')
      .populate('doctor', 'doctorCode name specialization department')
      .sort({ admissionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(res, 'Admissions retrieved successfully', admissions, 200, {
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
 * Get Single Admission
 * GET /api/admissions/:id
 */
const getAdmissionById = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!admission) {
      return next(ApiError.notFound('Admission record not found.'));
    }

    return sendSuccess(res, 'Admission details retrieved', admission);
  } catch (error) {
    next(error);
  }
};

/**
 * Admit Patient (Create Admission)
 * POST /api/admissions
 */
const createAdmission = async (req, res, next) => {
  try {
    const {
      patient,
      doctor,
      ward,
      roomNumber,
      bedNumber,
      admissionReason,
      diagnosis,
      dailyRate,
      nurseInCharge,
    } = req.body;

    if (!patient || !doctor || !ward || !roomNumber || !bedNumber || !admissionReason) {
      return next(
        ApiError.badRequest(
          'Patient, Doctor, Ward, Room Number, Bed Number, and Admission Reason are required.'
        )
      );
    }

    const [patientDoc, doctorDoc] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);

    if (!patientDoc) return next(ApiError.badRequest('Invalid patient ID'));
    if (!doctorDoc) return next(ApiError.badRequest('Invalid doctor ID'));

    // Check if bed is already occupied by active admission
    const bedTaken = await Admission.findOne({
      ward,
      bedNumber,
      status: 'Admitted',
    });

    if (bedTaken) {
      return next(
        ApiError.conflict(`Bed ${bedNumber} in ${ward} is currently occupied by another patient.`)
      );
    }

    const admissionNumber = await generateAdmissionNumber();

    const admission = await Admission.create({
      admissionNumber,
      patient,
      doctor,
      ward,
      roomNumber,
      bedNumber,
      admissionReason,
      diagnosis: diagnosis || '',
      dailyRate: Number(dailyRate) || 150,
      nurseInCharge: nurseInCharge || '',
      status: 'Admitted',
      admissionDate: new Date(),
    });

    const populated = await Admission.findById(admission._id)
      .populate('patient', 'patientId firstName lastName')
      .populate('doctor', 'name');

    await logActivity(req, {
      action: 'CREATE',
      module: 'Admissions',
      description: `Admitted patient ${patientDoc.firstName} ${patientDoc.lastName} to ${ward} (Bed ${bedNumber}) under Dr. ${doctorDoc.name}`,
    });

    return sendSuccess(res, 'Patient admitted successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Discharge Patient
 * POST /api/admissions/:id/discharge
 */
const dischargePatient = async (req, res, next) => {
  try {
    const { dischargeSummary, dischargeCondition = 'Stable' } = req.body;
    const admission = await Admission.findById(req.params.id).populate('patient', 'firstName lastName');

    if (!admission) {
      return next(ApiError.notFound('Admission record not found.'));
    }

    if (admission.status === 'Discharged') {
      return next(ApiError.badRequest('Patient has already been discharged.'));
    }

    admission.status = 'Discharged';
    admission.dischargeDate = new Date();
    admission.dischargeSummary = dischargeSummary || 'Discharged in stable clinical state.';
    admission.dischargeCondition = dischargeCondition;
    await admission.save();

    await logActivity(req, {
      action: 'DISCHARGE',
      module: 'Admissions',
      description: `Discharged patient ${admission.patient?.firstName} ${admission.patient?.lastName} from Admission #${admission.admissionNumber}`,
    });

    return sendSuccess(res, 'Patient discharged successfully', admission);
  } catch (error) {
    next(error);
  }
};

/**
 * Log Patient Vitals
 * POST /api/admissions/:id/vitals
 */
const addVitals = async (req, res, next) => {
  try {
    const { bloodPressure, heartRate, temperature, respiratoryRate, oxygenSaturation, notes } = req.body;
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return next(ApiError.notFound('Admission record not found.'));
    }

    admission.vitalsLog.push({
      recordedAt: new Date(),
      bloodPressure,
      heartRate,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      notes,
      recordedBy: req.user?.name || 'Nurse on Duty',
    });

    await admission.save();
    return sendSuccess(res, 'Vitals recorded successfully', admission.vitalsLog);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Admission
 * PUT /api/admissions/:id
 */
const updateAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return next(ApiError.notFound('Admission record not found.'));
    }

    Object.assign(admission, req.body);
    await admission.save();

    return sendSuccess(res, 'Admission record updated successfully', admission);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Admission
 * DELETE /api/admissions/:id
 */
const deleteAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) {
      return next(ApiError.notFound('Admission record not found.'));
    }
    return sendSuccess(res, 'Admission record deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Admission & Bed Stats
 * GET /api/admissions/stats
 */
const getAdmissionStats = async (req, res, next) => {
  try {
    const totalBedsCapacity = 80; // Total licensed inpatient bed capacity
    const admittedCount = await Admission.countDocuments({ status: 'Admitted' });
    const dischargedMonthCount = await Admission.countDocuments({
      status: 'Discharged',
      dischargeDate: { $gte: new Date(new Date().setDate(1)) },
    });

    const wardBreakdown = await Admission.aggregate([
      { $match: { status: 'Admitted' } },
      { $group: { _id: '$ward', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, 'Admission stats retrieved', {
      totalBeds: totalBedsCapacity,
      occupiedBeds: admittedCount,
      availableBeds: Math.max(0, totalBedsCapacity - admittedCount),
      occupancyRate: Math.round((admittedCount / totalBedsCapacity) * 100),
      dischargedThisMonth: dischargedMonthCount,
      wardBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdmissions,
  getAdmissionById,
  createAdmission,
  dischargePatient,
  addVitals,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
};
