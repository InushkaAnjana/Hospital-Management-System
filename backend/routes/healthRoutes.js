const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const validate = require('../middleware/validate');
const { healthValidator } = require('../validators');

// GET /api/health (with optional request validation)
router.get('/', validate(healthValidator.healthQuerySchema), healthController.checkHealth);

module.exports = router;
