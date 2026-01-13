import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexverse';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-jwt-secret';

export const CLOUDINARY_CONFIG = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

export const PORT = process.env.PORT || 5001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const FRONTEND_URL = process.env.FRONTEND_URL || 
  (NODE_ENV === 'production' 
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'nexverse-net.onrender.com'}` 
    : 'http://localhost:5174');

export const EXPO_DEV_URL = process.env.EXPO_DEV_URL || 'http://localhost:8081';

// App Codename for masking sensitive URLs in logs
export const APP_CODENAME = process.env.APP_CODENAME || 'Red Ball';

// Helper function to mask URLs in logs
export const maskURL = (url) => {
  if (!url) return APP_CODENAME;
  if (NODE_ENV === 'production') {
    return APP_CODENAME;
  }
  return url; // Show real URL in development
};

// Keep-Alive Configuration (to prevent Render free tier from sleeping)
export const KEEP_ALIVE_ENABLED = process.env.KEEP_ALIVE_ENABLED === 'true';
export const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL || '';
export const KEEP_ALIVE_INTERVAL = parseInt(process.env.KEEP_ALIVE_INTERVAL) || 840000; // 14 minutes default