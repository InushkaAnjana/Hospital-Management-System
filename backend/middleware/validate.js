const ApiError = require('../utils/ApiError');

/**
 * Generic Request Validation Middleware
 * Accepts an object with rules for 'body', 'query', and/or 'params'.
 * 
 * Example schema:
 * {
 *   query: {
 *     detailed: { type: 'boolean', optional: true }
 *   },
 *   body: {
 *     email: { type: 'string', required: true, pattern: /^\S+@\S+\.\S+$/ },
 *     role: { type: 'string', required: true, enum: ['Admin', 'Doctor'] }
 *   }
 * }
 */
const validate = (schema) => (req, res, next) => {
  const validationErrors = [];

  ['params', 'query', 'body'].forEach((location) => {
    if (!schema[location]) return;

    const data = req[location] || {};
    const rules = schema[location];

    Object.entries(rules).forEach(([field, rule]) => {
      const value = data[field];
      const isPresent = value !== undefined && value !== null && value !== '';

      // Required Check
      if (rule.required && !isPresent) {
        validationErrors.push({
          location,
          field,
          message: rule.message || `${field} is required in ${location}`,
        });
        return;
      }

      // If optional and not provided, skip further checks
      if (!isPresent && (rule.optional || !rule.required)) {
        return;
      }

      // Type Check
      if (rule.type) {
        if (rule.type === 'number' && isNaN(Number(value))) {
          validationErrors.push({
            location,
            field,
            message: `${field} must be a valid number`,
          });
        } else if (rule.type === 'boolean') {
          const isBool = value === true || value === false || value === 'true' || value === 'false';
          if (!isBool) {
            validationErrors.push({
              location,
              field,
              message: `${field} must be a boolean (true/false)`,
            });
          }
        } else if (rule.type === 'string' && typeof value !== 'string') {
          validationErrors.push({
            location,
            field,
            message: `${field} must be a string`,
          });
        } else if (rule.type === 'array' && !Array.isArray(value)) {
          validationErrors.push({
            location,
            field,
            message: `${field} must be an array`,
          });
        }
      }

      // String Length checks
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          validationErrors.push({
            location,
            field,
            message: `${field} must be at least ${rule.minLength} characters long`,
          });
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          validationErrors.push({
            location,
            field,
            message: `${field} must not exceed ${rule.maxLength} characters`,
          });
        }
      }

      // Enum Check
      if (rule.enum && !rule.enum.includes(value)) {
        validationErrors.push({
          location,
          field,
          message: `${field} must be one of: [${rule.enum.join(', ')}]`,
        });
      }

      // Regex Pattern Check
      if (rule.pattern && !rule.pattern.test(value)) {
        validationErrors.push({
          location,
          field,
          message: rule.patternMessage || `${field} format is invalid`,
        });
      }

      // Custom Validator Function
      if (typeof rule.custom === 'function') {
        const customResult = rule.custom(value, req);
        if (customResult !== true) {
          validationErrors.push({
            location,
            field,
            message: typeof customResult === 'string' ? customResult : `${field} failed validation`,
          });
        }
      }
    });
  });

  if (validationErrors.length > 0) {
    return next(ApiError.badRequest('Request validation failed', validationErrors));
  }

  next();
};

module.exports = validate;
