const healthService = require('../services/healthService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Health Check Controller
 * GET /api/health
 */
const checkHealth = async (req, res, next) => {
  try {
    const healthData = await healthService.getSystemHealth();
    return successResponse(res, 'Hospital Management System API is healthy', healthData);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  checkHealth,
};
