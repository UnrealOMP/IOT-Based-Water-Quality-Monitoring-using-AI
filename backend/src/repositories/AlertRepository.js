import { Alert as AlertModel } from '../database/models/Alert.js';
import { Alert as AlertDomain } from '../domain/models/Alert.js';

/**
 * Repository: Alert
 * Handles data persistence for alerts
 */
export class AlertRepository {
  /**
   * Save an alert
   */
  async create(alert) {
    const doc = new AlertModel(alert);
    const saved = await doc.save();
    return this._toDomain(saved);
  }

  /**
   * Get unacknowledged alerts for a device
   */
  async getUnacknowledged(deviceId) {
    const docs = await AlertModel
      .find({ deviceId, acknowledged: false })
      .sort({ timestamp: -1 })
      .lean();
    
    return docs.map(doc => this._toDomain(doc));
  }

  /**
   * Get alerts by severity
   */
  async getBySeverity(deviceId, severity, limit = 50) {
    const docs = await AlertModel
      .find({ deviceId, severity })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return docs.map(doc => this._toDomain(doc));
  }

  /**
   * Acknowledge an alert
   */
  async acknowledge(alertId, acknowledgedBy) {
    const doc = await AlertModel.findByIdAndUpdate(
      alertId,
      {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      },
      { new: true }
    ).lean();
    
    return doc ? this._toDomain(doc) : null;
  }

  // Get latest HIGH or CRITICAL alert for device and parameter
  async getLastHighAlert(deviceId, parameter) {
    return await AlertModel.findOne({
      deviceId,
      parameter,
      severity: { $in: ['HIGH', 'CRITICAL'] },
    }).sort({ timestamp: -1 });
  }

  /**
   * Get recent alerts
   */
  async getRecent(deviceId, limit = 50) {
    const docs = await AlertModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return docs.map(doc => this._toDomain(doc));
  }

  /**
   * Convert database document to domain model
   */
  _toDomain(doc) {
    return new AlertDomain({
      deviceId: doc.deviceId,
      timestamp: doc.timestamp,
      severity: doc.severity,
      title: doc.title,
      message: doc.message,
      parameter: doc.parameter,
      value: doc.value,
      threshold: doc.threshold,
      acknowledged: doc.acknowledged,
      acknowledgedBy: doc.acknowledgedBy,
      acknowledgedAt: doc.acknowledgedAt,
    });
  }
}
