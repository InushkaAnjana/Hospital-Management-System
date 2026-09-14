const express = require('express');
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  markAttendance,
  applyLeave,
  updateLeaveStatus,
  deleteStaff,
  getStaffStats,
} = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', authorize('Administrator'), getStaffStats);

router.get(
  '/',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Accountant'),
  getStaff
);

router.get(
  '/:id',
  authorize('Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Accountant'),
  getStaffById
);

router.post(
  '/',
  authorize('Administrator'),
  createStaff
);

router.put(
  '/:id',
  authorize('Administrator'),
  updateStaff
);

router.post(
  '/:id/attendance',
  authorize('Administrator', 'Receptionist'),
  markAttendance
);

router.post(
  '/:id/leave',
  applyLeave
);

router.patch(
  '/:staffId/leave/:leaveId/status',
  authorize('Administrator'),
  updateLeaveStatus
);

router.delete(
  '/:id',
  authorize('Administrator'),
  deleteStaff
);

module.exports = router;
