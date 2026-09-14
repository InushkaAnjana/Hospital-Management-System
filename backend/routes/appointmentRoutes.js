const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View appointments: Admin, Doctor, Nurse, Receptionist
router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  appointmentController.getAppointments
);

router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  appointmentController.getAppointmentById
);

// Book appointment: Admin, Receptionist, Doctor, Nurse
router.post(
  '/',
  authorize('Administrator', 'Receptionist', 'Doctor', 'Nurse'),
  appointmentController.bookAppointment
);

// Reschedule: Admin, Receptionist, Doctor
router.put(
  '/:id/reschedule',
  authorize('Administrator', 'Receptionist', 'Doctor'),
  appointmentController.rescheduleAppointment
);

// Cancel: Admin, Receptionist, Doctor
router.put(
  '/:id/cancel',
  authorize('Administrator', 'Receptionist', 'Doctor'),
  appointmentController.cancelAppointment
);

// Status update (e.g. In-Consultation, Completed): Doctor, Nurse, Receptionist, Admin
router.put(
  '/:id/status',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist'),
  appointmentController.updateAppointmentStatus
);

module.exports = router;
