const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View records
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  medicalRecordController.getMedicalRecords
);

router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  medicalRecordController.getMedicalRecordById
);

// Create record: Doctor, Administrator
router.post(
  '/',
  authorize('Administrator', 'Doctor'),
  medicalRecordController.createMedicalRecord
);

// Update record: Doctor, Administrator
router.put(
  '/:id',
  authorize('Administrator', 'Doctor'),
  medicalRecordController.updateMedicalRecord
);

// Add medical/lab report: Doctor, Nurse, Laboratory Staff, Administrator
router.post(
  '/:id/reports',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  medicalRecordController.addMedicalReport
);

module.exports = router;
