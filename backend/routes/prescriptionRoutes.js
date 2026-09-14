const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View prescriptions: Doctors, Pharmacists, Nurses, Admin
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Pharmacist'),
  prescriptionController.getPrescriptions
);

router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Pharmacist'),
  prescriptionController.getPrescriptionById
);

// Create prescription: Doctor, Admin
router.post(
  '/',
  authorize('Administrator', 'Doctor'),
  prescriptionController.createPrescription
);

// Dispense prescription: Pharmacist, Admin
router.put(
  '/:id/dispense',
  authorize('Administrator', 'Pharmacist'),
  prescriptionController.dispensePrescription
);

// Cancel prescription: Doctor, Admin
router.put(
  '/:id/cancel',
  authorize('Administrator', 'Doctor'),
  prescriptionController.cancelPrescription
);

module.exports = router;
