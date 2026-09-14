const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View doctors: all staff
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/schedule', doctorController.getDoctorSchedule);

// Manage doctors: Administrator only
router.post('/', authorize('Administrator'), doctorController.createDoctor);
router.put('/:id', authorize('Administrator', 'Doctor'), doctorController.updateDoctor);
router.delete('/:id', authorize('Administrator'), doctorController.deleteDoctor);

module.exports = router;
