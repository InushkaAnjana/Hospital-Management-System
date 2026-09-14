const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

// All patient endpoints require authentication
router.use(authenticate);

// View patients: Administrator, Doctor, Nurse, Receptionist, Laboratory Staff, Pharmacist, Accountant
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant'),
  patientController.getPatients
);

router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant'),
  patientController.getPatientById
);

// Create & update patients: Administrator, Doctor, Nurse, Receptionist
router.post(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  patientController.createPatient
);

router.put(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  patientController.updatePatient
);

// Delete patient: Administrator only
router.delete(
  '/:id',
  authorize('Administrator'),
  patientController.deletePatient
);

// Add document to patient: Administrator, Doctor, Nurse, Laboratory Staff
router.post(
  '/:id/documents',
  authorize('Administrator', 'Doctor', 'Nurse', 'Laboratory Staff'),
  patientController.addPatientDocument
);

module.exports = router;
