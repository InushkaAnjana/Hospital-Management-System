const path = require('path');
const dotenv = require('dotenv');

// Load .env file from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

// Validate critical environment variables
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`[Configuration Error] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please verify your .env file in the backend directory.');
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  
  port: parseInt(process.env.PORT, 10) || 5000,
  
  mongo: {
    uri: process.env.MONGO_URI,
    options: {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production',
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  cors: {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : ['http://localhost:5173'],
    credentials: true,
  },
};

module.exports = env;
