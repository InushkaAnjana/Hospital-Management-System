const LabTest = require('../models/LabTest');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { logActivity } = require('../utils/auditLogger');

/**
 * Generate Lab Test Code (e.g. LAB-2026-0001)
 */
const generateTestCode = async () => {
  const year = new Date().getFullYear();
  const count = await LabTest.countDocuments();
  return `LAB-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get All Lab Tests
 * GET /api/lab
 */
const getLabTests = async (req, res, next) => {
  try {
    const { patient, doctor, status, priority, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ testCode: regex }, { testName: regex }, { category: regex }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LabTest.countDocuments(filter);

    const tests = await LabTest.find(filter)
      .populate('patient', 'patientId firstName lastName phone age gender bloodGroup')
      .populate('doctor', 'doctorCode name specialization department')
      .populate('sampleCollectedBy', 'name role')
      .populate('conductedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(res, 'Lab tests retrieved successfully', tests, 200, {
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
 * Get Single Lab Test
 * GET /api/lab/:id
 */
const getLabTestById = async (req, res, next) => {
  try {
    const test = await LabTest.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('sampleCollectedBy', 'name role')
      .populate('conductedBy', 'name role');

    if (!test) {
      return next(ApiError.notFound('Lab test record not found.'));
    }

    return sendSuccess(res, 'Lab test retrieved', test);
  } catch (error) {
    next(error);
  }
};

/**
 * Create / Order Lab Test
 * POST /api/lab
 */
const createLabTest = async (req, res, next) => {
  try {
    const { patient, doctor, testName, category, priority, sampleType, cost, technicianNotes } = req.body;

    if (!patient || !doctor || !testName) {
      return next(ApiError.badRequest('Patient, Doctor, and Test Name are required.'));
    }

    const [patientDoc, doctorDoc] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);

    if (!patientDoc) return next(ApiError.badRequest('Invalid patient ID'));
    if (!doctorDoc) return next(ApiError.badRequest('Invalid doctor ID'));

    const testCode = await generateTestCode();

    const labTest = await LabTest.create({
      testCode,
      patient,
      doctor,
      testName,
      category: category || 'General Pathology',
      priority: priority || 'Routine',
      sampleType: sampleType || 'Blood',
      cost: Number(cost) || 0,
      technicianNotes: technicianNotes || '',
      status: 'Ordered',
    });

    const populated = await LabTest.findById(labTest._id)
      .populate('patient', 'patientId firstName lastName')
      .populate('doctor', 'name');

    await logActivity(req, {
      action: 'CREATE',
      module: 'Laboratory',
      description: `Ordered lab test ${testCode} (${testName}) for patient ${patientDoc.firstName} ${patientDoc.lastName}`,
    });

    return sendSuccess(res, 'Lab test order placed successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Collect Sample
 * PATCH /api/lab/:id/collect
 */
const collectSample = async (req, res, next) => {
  try {
    const test = await LabTest.findById(req.params.id).populate('patient', 'firstName lastName');
    if (!test) {
      return next(ApiError.notFound('Lab test not found.'));
    }

    test.status = 'Sample Collected';
    test.sampleCollectedAt = new Date();
    test.sampleCollectedBy = req.user ? req.user._id : null;
    await test.save();

    await logActivity(req, {
      action: 'COLLECT_SAMPLE',
      module: 'Laboratory',
      description: `Collected ${test.sampleType} sample for lab test ${test.testCode}`,
    });

    return sendSuccess(res, 'Sample collection recorded successfully', test);
  } catch (error) {
    next(error);
  }
};

/**
 * Enter Lab Results & Complete
 * POST /api/lab/:id/result
 */
const enterResult = async (req, res, next) => {
  try {
    const { results, technicianNotes } = req.body;
    const test = await LabTest.findById(req.params.id).populate('patient', 'firstName lastName');
    if (!test) {
      return next(ApiError.notFound('Lab test not found.'));
    }

    if (results && Array.isArray(results)) {
      test.results = results;
    }
    if (technicianNotes !== undefined) {
      test.technicianNotes = technicianNotes;
    }

    test.status = 'Completed';
    test.completedAt = new Date();
    test.conductedBy = req.user ? req.user._id : null;
    await test.save();

    await logActivity(req, {
      action: 'ENTER_RESULT',
      module: 'Laboratory',
      description: `Entered diagnostic results for lab test ${test.testCode}`,
    });

    return sendSuccess(res, 'Lab test results recorded and finalized', test);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Lab Test
 * PUT /api/lab/:id
 */
const updateLabTest = async (req, res, next) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) {
      return next(ApiError.notFound('Lab test not found.'));
    }

    Object.assign(test, req.body);
    await test.save();

    return sendSuccess(res, 'Lab test updated successfully', test);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Lab Test
 * DELETE /api/lab/:id
 */
const deleteLabTest = async (req, res, next) => {
  try {
    const test = await LabTest.findByIdAndDelete(req.params.id);
    if (!test) {
      return next(ApiError.notFound('Lab test not found.'));
    }
    return sendSuccess(res, 'Lab test removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Lab Module KPI Statistics
 * GET /api/lab/stats
 */
const getLabStats = async (req, res, next) => {
  try {
    const [total, ordered, collected, completed, urgent] = await Promise.all([
      LabTest.countDocuments(),
      LabTest.countDocuments({ status: 'Ordered' }),
      LabTest.countDocuments({ status: 'Sample Collected' }),
      LabTest.countDocuments({ status: 'Completed' }),
      LabTest.countDocuments({ priority: { $in: ['Urgent', 'Emergency'] }, status: { $ne: 'Completed' } }),
    ]);

    return sendSuccess(res, 'Lab stats retrieved', {
      total,
      ordered,
      collected,
      completed,
      urgent,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabTests,
  getLabTestById,
  createLabTest,
  collectSample,
  enterResult,
  updateLabTest,
  deleteLabTest,
  getLabStats,
};
