const Medicine = require('../models/Medicine');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Generate next medicine item code (e.g. MED-001)
 */
const generateMedicineCode = async () => {
  const count = await Medicine.countDocuments();
  return `MED-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Get All Medicines
 * GET /api/medicines
 */
const getMedicines = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { genericName: regex },
        { itemCode: regex },
        { category: regex },
      ];
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    return sendSuccess(res, 'Medicines retrieved successfully', medicines);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Medicine
 * GET /api/medicines/:id
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return next(ApiError.notFound('Medicine not found.'));
    }
    return sendSuccess(res, 'Medicine details retrieved', medicine);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Medicine
 * POST /api/medicines
 */
const createMedicine = async (req, res, next) => {
  try {
    const {
      name,
      genericName,
      category,
      form,
      strength,
      unitPrice,
      stockQuantity,
      reorderLevel,
      expiryDate,
      manufacturer,
    } = req.body;

    if (!name || !genericName || !unitPrice || !expiryDate) {
      return next(ApiError.badRequest('Name, Generic Name, Unit Price, and Expiry Date are required.'));
    }

    const itemCode = req.body.itemCode || (await generateMedicineCode());

    const medicine = await Medicine.create({
      itemCode,
      name,
      genericName,
      category: category || 'General',
      form: form || 'Tablet',
      strength: strength || '500mg',
      unitPrice: Number(unitPrice),
      stockQuantity: Number(stockQuantity) || 0,
      reorderLevel: Number(reorderLevel) || 20,
      expiryDate: new Date(expiryDate),
      manufacturer: manufacturer || 'CarePulse Pharmaceuticals',
    });

    return sendSuccess(res, 'Medicine created successfully', medicine, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Medicine / Restock
 * PUT /api/medicines/:id
 */
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return next(ApiError.notFound('Medicine not found.'));
    }

    Object.assign(medicine, req.body);
    await medicine.save();

    return sendSuccess(res, 'Medicine updated successfully', medicine);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Medicine
 * DELETE /api/medicines/:id
 */
const deleteMedicine = async (req, res, next) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return next(ApiError.notFound('Medicine not found.'));
    }
    return sendSuccess(res, 'Medicine deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
