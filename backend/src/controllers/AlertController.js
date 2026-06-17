import { DataQueryService } from '../services/DataQueryService.js';
import { AlertRepository } from '../repositories/AlertRepository.js';
import { sendAlertEmail } from '../services/EmailService.js';
import { config } from '../config/index.js'; 

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
        data: alerts,
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
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/alerts
   * Create a new alert and send email if severity is HIGH or CRITICAL
   */
  createAlert = async (req, res, next) => {
    try {
      const alertData = req.body;
      const alert = await this.alertRepo.create(alertData);

      if (['HIGH', 'CRITICAL'].includes(alert.severity)) {
        if (config.alerts.emailEnabled) {
          const last = await this.alertRepo.getLastHighAlert(alert.deviceId, alert.parameter);
    
          const now = Date.now();
          const lastSent = last?.timestamp?.getTime() || 0;
          const minutesSinceLast = (now - lastSent) / 60000;

          if (minutesSinceLast > 10) {
            await sendAlertEmail(
              process.env.ALERT_RECIPIENT,
              `⚠ ${alert.severity} Alert: ${alert.parameter}`,
              `Device ${alert.deviceId} reported ${alert.parameter} = ${alert.value} (threshold: ${alert.threshold})`
            );
          } else {
            console.warn(`📭 Skipping email: Alert for ${alert.parameter} on ${alert.deviceId} was already sent ${minutesSinceLast.toFixed(2)} minutes ago`);
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'Alert created and email sent (if applicable)',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  };
}