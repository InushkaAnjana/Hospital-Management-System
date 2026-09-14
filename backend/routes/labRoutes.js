const express = require('express');
const router = express.Router();
const {
  getLabTests,
  getLabTestById,
  createLabTest,
  collectSample,
  enterResult,
  updateLabTest,
  deleteLabTest,
  getLabStats,
} = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View tests & stats
router.get('/stats', getLabStats);
router.get(
  '/',
  authorize('Administrator', 'Laboratory Staff', 'Doctor', 'Nurse'),
  getLabTests
);
router.get(
  '/:id',
  authorize('Administrator', 'Laboratory Staff', 'Doctor', 'Nurse'),
  getLabTestById
);

// Order tests: Doctors, Admin
router.post(
  '/',
  authorize('Administrator', 'Doctor'),
  createLabTest
);

// Collect sample: Lab Staff, Nurse, Admin
router.patch(
  '/:id/collect',
  authorize('Administrator', 'Laboratory Staff', 'Nurse'),
  collectSample
);

// Enter result: Lab Staff, Admin
router.post(
  '/:id/result',
  authorize('Administrator', 'Laboratory Staff'),
  enterResult
);

// Update/Delete: Lab Staff, Admin
router.put(
  '/:id',
  authorize('Administrator', 'Laboratory Staff'),
  updateLabTest
);
router.delete(
  '/:id',
  authorize('Administrator'),
  deleteLabTest
);

module.exports = router;
