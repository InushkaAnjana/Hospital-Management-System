const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate EMR Record ID (e.g. EMR-2026-0001)
 */
const generateRecordId = async () => {
  const year = new Date().getFullYear();
  const count = await MedicalRecord.countDocuments();
  return `EMR-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get All Medical Records
 * GET /api/medical-records
 */
const getMedicalRecords = async (req, res, next) => {
  try {
    const { patient, doctor, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;

    if (search) {
      filter.$or = [
        { recordId: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } },
        { clinicalNotes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await MedicalRecord.countDocuments(filter);

    const records = await MedicalRecord.find(filter)
      .populate('patient', 'patientId firstName lastName bloodGroup gender age phone')
      .populate('doctor', 'doctorCode name specialization department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(
      res,
      'Medical records retrieved successfully',
      records,
      200,
      {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Medical Record
 * GET /api/medical-records/:id
 */
const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('appointment');

    if (!record) {
      return next(ApiError.notFound('Medical record not found.'));
    }

    return sendSuccess(res, 'Medical record retrieved', record);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Medical Record
 * POST /api/medical-records
 */
const createMedicalRecord = async (req, res, next) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      diagnosis,
      symptoms,
      clinicalNotes,
      vitalSigns,
      treatmentHistory,
      reports,
    } = req.body;

    if (!patient || !doctor || !diagnosis) {
      return next(ApiError.badRequest('Patient, Doctor, and Diagnosis are required.'));
    }

    const [patientExists, doctorExists] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);

    if (!patientExists) return next(ApiError.badRequest('Patient does not exist.'));
    if (!doctorExists) return next(ApiError.badRequest('Doctor does not exist.'));

    const recordId = await generateRecordId();

    const record = await MedicalRecord.create({
      recordId,
      patient,
      doctor,
      appointment: appointment || null,
      diagnosis,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
      clinicalNotes: clinicalNotes || '',
      vitalSigns: vitalSigns || {},
      treatmentHistory: treatmentHistory || [
        {
          date: new Date(),
          treatment: `Initial Consultation & Diagnosis: ${diagnosis}`,
          doctorNotes: clinicalNotes || '',
        },
      ],
      reports: reports || [],
    });

    const populated = await MedicalRecord.findById(record._id)
      .populate('patient', 'patientId firstName lastName bloodGroup gender age')
      .populate('doctor', 'name specialization');

    return sendSuccess(res, 'Medical record created successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Medical Record
 * PUT /api/medical-records/:id
 */
const updateMedicalRecord = async (req, res, next) => {
  try {
    const updated = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('patient', 'patientId firstName lastName')
      .populate('doctor', 'name specialization');

    if (!updated) {
      return next(ApiError.notFound('Medical record not found.'));
    }

    return sendSuccess(res, 'Medical record updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Add Diagnostic / Medical Report to Record
 * POST /api/medical-records/:id/reports
 */
const addMedicalReport = async (req, res, next) => {
  try {
    const { title, reportType, fileUrl, summary } = req.body;

    if (!title || !fileUrl) {
      return next(ApiError.badRequest('Report title and fileUrl are required.'));
    }

    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return next(ApiError.notFound('Medical record not found.'));
    }

    record.reports.push({
      title,
      reportType: reportType || 'Lab Test',
      fileUrl,
      summary: summary || '',
      date: new Date(),
    });

    await record.save();

    return sendSuccess(res, 'Report attached to medical record successfully', record.reports);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  addMedicalReport,
};
