const asyncHandler = require('../middleware/asyncHandler');
const healthService = require('../services/healthService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Health Check Controller
 * GET /api/health
 */
const checkHealth = asyncHandler(async (req, res) => {
  const isVerbose = req.query.verbose === 'true';
  const healthData = await healthService.getSystemHealth(isVerbose);
  
  return sendSuccess(res, 'Hospital Management System API is healthy', healthData);
});

module.exports = {
  checkHealth,
};
