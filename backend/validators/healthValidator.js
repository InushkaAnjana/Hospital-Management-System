/**
 * Health Check Request Validator Schema
 */
const healthQuerySchema = {
  query: {
    verbose: {
      type: 'boolean',
      optional: true,
      message: 'verbose must be true or false if provided',
    },
  },
};

module.exports = {
  healthQuerySchema,
};
