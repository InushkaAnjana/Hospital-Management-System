const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View medicines: Doctors (to prescribe), Pharmacists, Nurses, Admin
router.get(
  '/',
  authorize('Administrator', 'Pharmacist', 'Doctor', 'Nurse'),
  medicineController.getMedicines
);

router.get(
  '/:id',
  authorize('Administrator', 'Pharmacist', 'Doctor', 'Nurse'),
  medicineController.getMedicineById
);

// Manage inventory: Pharmacist, Administrator
router.post(
  '/',
  authorize('Administrator', 'Pharmacist'),
  medicineController.createMedicine
);

router.put(
  '/:id',
  authorize('Administrator', 'Pharmacist'),
  medicineController.updateMedicine
);

router.delete(
  '/:id',
  authorize('Administrator', 'Pharmacist'),
  medicineController.deleteMedicine
);

module.exports = router;
