const path = require('path');
const dotenv = require('dotenv');

// Load .env file from backend root (in local development)
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// Validate critical environment variables
const missingVars = [];
if (!mongoUri) missingVars.push('MONGODB_URI (or MONGO_URI)');
if (!jwtSecret) missingVars.push('JWT_SECRET');

if (missingVars.length > 0) {
  console.error(`[Configuration Error] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please verify your environment configuration or .env file.');
  process.exit(1);
}

// Parse frontend allowed origins from FRONTEND_URL or CLIENT_URL
const rawOrigins = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
const parsedOrigins = rawOrigins
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',

  port: parseInt(process.env.PORT, 10) || 5000,

  mongo: {
    uri: mongoUri,
    options: {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production',
    },
  },

  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  cors: {
    origin: parsedOrigins.length > 0 ? parsedOrigins : ['http://localhost:5173'],
    credentials: true,
  },
};

module.exports = env;
