import { DataQueryService } from '../services/DataQueryService.js';
import { AlertRepository } from '../repositories/AlertRepository.js';

/**
 * Controller: Alert
 * Handles alert-related requests
 */
export class AlertController {
  constructor() {
    this.queryService = new DataQueryService();
    this.alertRepo = new AlertRepository();
  }

  /**
   * GET /api/v1/alerts
   * Get alerts for a device
   */
  getAlerts = async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId || req.deviceId;
      const acknowledged = req.query.acknowledged === 'true';
      const limit = parseInt(req.query.limit || '50', 10);

      let alerts;
      if (acknowledged === false) {
        alerts = await this.queryService.getUnacknowledgedAlerts(deviceId);
      } else {
        alerts = await this.queryService.getRecentAlerts(deviceId, limit);
      }

      res.json({
        success: true,
        data: alerts.map(a => a.toJSON()),
        count: alerts.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/alerts/:alertId/acknowledge
   * Acknowledge an alert
   */
  acknowledge = async (req, res, next) => {
    try {
      const { alertId } = req.params;
      const acknowledgedBy = req.user?.username || 'system';

      const alert = await this.alertRepo.acknowledge(alertId, acknowledgedBy);

      if (!alert) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Alert not found',
        });
      }

      res.json({
        success: true,
        message: 'Alert acknowledged',
        data: alert.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };
}
