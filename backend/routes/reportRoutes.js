const express = require('express');
const router = express.Router();
const {
  getPatientReport,
  getAppointmentReport,
  getRevenueReport,
  getPharmacyReport,
  getLabReport,
  getStaffReport,
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Patient Reports: Admin, Doctor, Receptionist
router.get('/patients', authorize('Administrator', 'Doctor', 'Receptionist'), getPatientReport);

// Appointment Reports: Admin, Doctor, Receptionist
router.get('/appointments', authorize('Administrator', 'Doctor', 'Receptionist'), getAppointmentReport);

// Financial/Revenue Reports: Admin, Accountant
router.get('/revenue', authorize('Administrator', 'Accountant'), getRevenueReport);

// Pharmacy Reports: Admin, Pharmacist, Doctor
router.get('/pharmacy', authorize('Administrator', 'Pharmacist', 'Doctor'), getPharmacyReport);

// Lab Reports: Admin, Laboratory Staff, Doctor
router.get('/laboratory', authorize('Administrator', 'Laboratory Staff', 'Doctor'), getLabReport);

// Staff Reports: Admin
router.get('/staff', authorize('Administrator'), getStaffReport);

module.exports = router;
