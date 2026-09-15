const env = require('./env');

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = env.cors.origin;
    const cleanOrigin = origin.replace(/\/+$/, '');

    // Check if origin is explicitly in allowed list or matches localhost in development
    const isAllowed =
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.includes('*') ||
      (env.isDevelopment && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin '${origin}' not allowed by policy. Allowed: ${allowedOrigins.join(', ')}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours preflight cache
};

module.exports = corsOptions;
