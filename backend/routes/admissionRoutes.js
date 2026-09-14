const express = require('express');
const router = express.Router();
const {
  getAdmissions,
  getAdmissionById,
  createAdmission,
  dischargePatient,
  addVitals,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
} = require('../controllers/admissionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', getAdmissionStats);

router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  getAdmissions
);

router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  getAdmissionById
);

router.post(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse'),
  createAdmission
);

router.post(
  '/:id/discharge',
  authorize('Administrator', 'Doctor'),
  dischargePatient
);

router.post(
  '/:id/vitals',
  authorize('Administrator', 'Doctor', 'Nurse'),
  addVitals
);

router.put(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse'),
  updateAdmission
);

router.delete(
  '/:id',
  authorize('Administrator'),
  deleteAdmission
);

module.exports = router;
