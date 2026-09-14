const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Audit logs are accessible by Administrators
router.get('/', authorize('Administrator'), getAuditLogs);

module.exports = router;
