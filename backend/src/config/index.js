import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/water_quality_monitoring',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: '7d',
  },
  deviceAuth: {
    apiKeys: (process.env.DEVICE_API_KEYS || '').split(',').filter(Boolean),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  ai: {
    debounceMs: parseInt(process.env.AI_DEBOUNCE_MS || '5000', 10),
    rollingWindowSize: parseInt(process.env.AI_ROLLING_WINDOW_SIZE || '10', 10),
    trendDetectionSamples: parseInt(process.env.AI_TREND_DETECTION_SAMPLES || '5', 10),
  },
  alerts: {
    emailEnabled: process.env.ALERT_EMAIL_ENABLED === 'true',
    smsEnabled: process.env.ALERT_SMS_ENABLED === 'true',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
