import { DeviceRepository } from '../repositories/DeviceRepository.js';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

/**
 * Middleware: Device Authentication
 * Validates API key from IoT devices
 */
export const deviceAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required.',
      });
    }

    const deviceRepo = new DeviceRepository();
    const device = await deviceRepo.findByApiKey(apiKey);

    // Validate API key
    if (!device && !config.deviceAuth.apiKeys.includes(apiKey)) {
      logger.warn(`Unauthorized API key attempt: ${apiKey.substring(0, 8)}...`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
    }

    // ✅ DO NOT generate deviceId here
    // deviceId must come from request payload (ESP32)
    req.deviceApiKey = apiKey;

    next();
  } catch (error) {
    logger.error('Device authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
};
