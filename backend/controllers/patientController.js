const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate next formatted Patient ID (e.g. PAT-2026-0001)
 */
const generatePatientId = async () => {
  const year = new Date().getFullYear();
  const count = await Patient.countDocuments();
  const sequentialNum = String(count + 1).padStart(4, '0');
  return `PAT-${year}-${sequentialNum}`;
};

/**
 * Get All Patients with search and pagination
 * GET /api/patients
 */
const getPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, gender, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (gender) filter.gender = gender;
    if (status) filter.status = status;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { patientId: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Patient.countDocuments(filter);

    const patients = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(
      res,
      'Patients retrieved successfully',
      patients,
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
 * Get Single Patient by ID with their complete clinical history
 * GET /api/patients/:id
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(ApiError.notFound('Patient record not found.'));
    }

    // Retrieve related clinical history concurrently
    const [appointments, medicalRecords, prescriptions] = await Promise.all([
      Appointment.find({ patient: patient._id }).populate('doctor', 'name specialization').sort({ appointmentDate: -1 }).limit(10),
      MedicalRecord.find({ patient: patient._id }).populate('doctor', 'name specialization').sort({ createdAt: -1 }).limit(10),
      Prescription.find({ patient: patient._id }).populate('doctor', 'name specialization').sort({ createdAt: -1 }).limit(10),
    ]);

    return sendSuccess(res, 'Patient details retrieved', {
      patient,
      appointments,
      medicalRecords,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create New Patient
 * POST /api/patients
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      medicalHistory,
    } = req.body;

    if (!firstName || !lastName || !phone || age === undefined || !gender) {
      return next(ApiError.badRequest('First name, last name, phone, age, and gender are required.'));
    }

    // Check duplicate phone if desired
    const patientId = await generatePatientId();

    const newPatient = await Patient.create({
      patientId,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      age: Number(age),
      gender,
      bloodGroup: bloodGroup || 'Unknown',
      phone,
      email: email || '',
      address: address || {},
      emergencyContact: emergencyContact || {},
      medicalHistory: medicalHistory || { chronicConditions: [], allergies: [], pastSurgeries: [], notes: '' },
    });

    return sendSuccess(res, 'Patient registered successfully', newPatient, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Patient Details
 * PUT /api/patients/:id
 */
const updatePatient = async (req, res, next) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return next(ApiError.notFound('Patient record not found to update.'));
    }

    return sendSuccess(res, 'Patient record updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Patient
 * DELETE /api/patients/:id
 */
const deletePatient = async (req, res, next) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(ApiError.notFound('Patient record not found to delete.'));
    }
    return sendSuccess(res, 'Patient record removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add Document to Patient
 * POST /api/patients/:id/documents
 */
const addPatientDocument = async (req, res, next) => {
  try {
    const { title, documentType, fileUrl, fileType } = req.body;
    if (!title || !fileUrl) {
      return next(ApiError.badRequest('Document title and file URL are required.'));
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(ApiError.notFound('Patient record not found.'));
    }

    patient.documents.push({
      title,
      documentType: documentType || 'Other',
      fileUrl,
      fileType: fileType || 'pdf',
      uploadedAt: new Date(),
    });

    await patient.save();
    return sendSuccess(res, 'Document attached to patient record successfully', patient.documents);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  addPatientDocument,
};
