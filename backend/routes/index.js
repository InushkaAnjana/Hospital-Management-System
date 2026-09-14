const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const departmentRoutes = require('./departmentRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');
const medicineRoutes = require('./medicineRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');

/**
 * Main API Route Registry
 */
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/medicines', medicineRoutes);
router.use('/prescriptions', prescriptionRoutes);

module.exports = router;
