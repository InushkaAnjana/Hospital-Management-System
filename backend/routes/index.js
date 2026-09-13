const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');

/**
 * Main API Route Registry
 */
router.use('/health', healthRoutes);

module.exports = router;
