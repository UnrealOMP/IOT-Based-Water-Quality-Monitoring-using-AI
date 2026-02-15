import { SensorReading as SensorReadingModel } from '../database/models/SensorReading.js';
import { SensorReading as SensorReadingDomain } from '../domain/models/SensorReading.js';

/**
 * Repository: Sensor Reading
 * Handles data persistence for sensor readings
 */
export class SensorReadingRepository {
  /**
   * Save a sensor reading
   */
  async create(sensorReading) {
    const doc = new SensorReadingModel(sensorReading.toJSON());
    const saved = await doc.save();
    return this._toDomain(saved);
  }

  /**
   * Get latest reading for a device
   */
  async getLatest(deviceId) {
    const doc = await SensorReadingModel
      .findOne({ deviceId })
      .sort({ timestamp: -1 })
      .lean();
    
    return doc ? this._toDomain(doc) : null;
  }

  /**
   * Get readings within time range
   */
  async getByTimeRange(deviceId, startTime, endTime, limit = 1000) {
    const docs = await SensorReadingModel
      .find({
        deviceId,
        timestamp: { $gte: startTime, $lte: endTime },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return docs.map(doc => this._toDomain(doc));
  }

  /**
   * Get recent readings for trend analysis
   */
  async getRecent(deviceId, count = 10) {
    const docs = await SensorReadingModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(count)
      .lean();
    
    return docs.map(doc => this._toDomain(doc)).reverse(); // Return in chronological order
  }

  /**
   * Convert database document to domain model
   */
  _toDomain(doc) {
    return new SensorReadingDomain({
      deviceId: doc.deviceId,
      timestamp: doc.timestamp,
      pH: doc.pH,
      tds: doc.tds,
      turbidity: doc.turbidity,
      temperature: doc.temperature,
      dissolvedOxygen: doc.dissolvedOxygen,
      metadata: doc.metadata || {},
    });
  }
}
