const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Medicine = require('../models/Medicine');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate Prescription Number (e.g. RX-2026-0001)
 */
const generatePrescriptionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Prescription.countDocuments();
  return `RX-${year}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Get All Prescriptions
 * GET /api/prescriptions
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const { patient, doctor, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (patient) filter.patient = patient;
    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { prescriptionNumber: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Prescription.countDocuments(filter);

    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'patientId firstName lastName phone age gender bloodGroup')
      .populate('doctor', 'doctorCode name specialization department')
      .populate('medicines.medicine', 'itemCode name genericName form unitPrice stockQuantity')
      .populate('dispensedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return sendSuccess(
      res,
      'Prescriptions retrieved successfully',
      prescriptions,
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
 * Get Single Prescription by ID
 * GET /api/prescriptions/:id
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('appointment')
      .populate('medicalRecord')
      .populate('medicines.medicine')
      .populate('dispensedBy', 'name role');

    if (!prescription) {
      return next(ApiError.notFound('Prescription not found.'));
    }

    return sendSuccess(res, 'Prescription details retrieved', prescription);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Prescription
 * POST /api/prescriptions
 */
const createPrescription = async (req, res, next) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      medicalRecord,
      diagnosis,
      medicines,
      notes,
    } = req.body;

    if (!patient || !doctor || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return next(ApiError.badRequest('Patient, Doctor, and at least one prescribed medicine are required.'));
    }

    const [patientExists, doctorExists] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);

    if (!patientExists) return next(ApiError.badRequest('Patient does not exist.'));
    if (!doctorExists) return next(ApiError.badRequest('Doctor does not exist.'));

    // Process prescribed items and link to medicine catalogue
    const resolvedMedicines = await Promise.all(
      medicines.map(async (item) => {
        let medicineDoc = null;
        if (item.medicine) {
          medicineDoc = await Medicine.findById(item.medicine);
        }

        return {
          medicine: medicineDoc ? medicineDoc._id : null,
          medicineName: item.medicineName || medicineDoc?.name || 'Unspecified Medicine',
          genericName: item.genericName || medicineDoc?.genericName || '',
          dosage: item.dosage || '1 Tablet',
          frequency: item.frequency || 'Twice daily',
          duration: item.duration || '5 days',
          quantity: Number(item.quantity) || 1,
          instructions: item.instructions || 'Take after meals',
        };
      })
    );

    const prescriptionNumber = await generatePrescriptionNumber();

    const prescription = await Prescription.create({
      prescriptionNumber,
      patient,
      doctor,
      appointment: appointment || null,
      medicalRecord: medicalRecord || null,
      diagnosis: diagnosis || '',
      medicines: resolvedMedicines,
      notes: notes || '',
      status: 'Active',
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'patientId firstName lastName age gender')
      .populate('doctor', 'name specialization')
      .populate('medicines.medicine', 'name genericName unitPrice');

    return sendSuccess(res, 'Prescription issued successfully', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Dispense Prescription (Pharmacy workflow - deducts medicine inventory)
 * PUT /api/prescriptions/:id/dispense
 */
const dispensePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return next(ApiError.notFound('Prescription not found.'));
    }

    if (prescription.status === 'Dispensed') {
      return next(ApiError.badRequest('This prescription has already been dispensed.'));
    }

    if (prescription.status === 'Cancelled') {
      return next(ApiError.badRequest('Cannot dispense a cancelled prescription.'));
    }

    // Deduct quantities from pharmacy inventory where linked
    for (const item of prescription.medicines) {
      if (item.medicine) {
        const med = await Medicine.findById(item.medicine);
        if (med) {
          med.stockQuantity = Math.max(0, med.stockQuantity - (item.quantity || 1));
          await med.save();
        }
      }
    }

    prescription.status = 'Dispensed';
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = req.user ? req.user._id : null;
    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'patientId firstName lastName')
      .populate('doctor', 'name')
      .populate('dispensedBy', 'name');

    return sendSuccess(res, 'Prescription dispensed and inventory updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Prescription
 * PUT /api/prescriptions/:id/cancel
 */
const cancelPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return next(ApiError.notFound('Prescription not found.'));
    }

    if (prescription.status === 'Dispensed') {
      return next(ApiError.badRequest('Cannot cancel a prescription that has already been dispensed.'));
    }

    prescription.status = 'Cancelled';
    await prescription.save();

    return sendSuccess(res, 'Prescription cancelled successfully', prescription);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  dispensePrescription,
  cancelPrescription,
};
