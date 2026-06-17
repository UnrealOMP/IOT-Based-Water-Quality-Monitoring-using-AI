import { SensorIngestionService } from '../services/SensorIngestionService.js';
import { DataQueryService } from '../services/DataQueryService.js';
import { logger } from '../config/logger.js';
import { Alert } from '../domain/models/Alert.js';
import { AlertRepository } from '../repositories/AlertRepository.js';
import { sendAlertEmail } from '../services/EmailService.js';

/**
 * Controller: Sensor
 * Handles sensor-related HTTP requests
 */
export class SensorController {
  constructor() {
    this.ingestionService = new SensorIngestionService();
    this.queryService = new DataQueryService();
    this.alertRepo = new AlertRepository();
  }

  /**
   * POST /api/v1/sensor/ingest
   * Ingests sensor data from IoT device
   */
  ingest = async (req, res, next) => {
    try {
      const sensorData = req.body;
      const deviceId = sensorData.deviceId;

      if (!deviceId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'deviceId is required in payload',
        });
      }

      const result = await this.ingestionService.ingestReading(sensorData, deviceId);

      // Fetch previous reading for comparison
      const previous = await this.queryService.getPreviousReading(deviceId);
      const current = result.reading;

      if (previous && Math.abs(current.pH - previous.pH) > 2.0) {
        const alert = new Alert({
          deviceId,
          severity: 'HIGH',
          title: 'Rapid pH Shift',
          message: `pH changed from ${previous.pH} to ${current.pH}`,
          parameter: 'pH',
          value: current.pH,
          threshold: 2.0
        });

        await this.alertRepo.create(alert);
        await sendAlertEmail(
          process.env.ALERT_RECIPIENT,
          `Rapid pH Change Detected`,
          `Device ${deviceId} detected a rapid pH shift. Current: ${current.pH}, Previous: ${previous.pH}`
        );
      }

      res.status(201).json({
        success: true,
        message: 'Sensor reading ingested successfully',
        data: {
          readingId: result.reading?.id || 'saved',
          evaluationGenerated: result.evaluation !== null,
          alertsGenerated: result.alerts.length,
        },
      });
    } catch (error) {
      logger.error('Sensor ingestion error:', error);
      next(error);
    }
  };

  /**
   * GET /api/v1/sensor/latest/:deviceId
   */
  getLatest = async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId;

      const reading = await this.queryService.getLatestReading(deviceId);

      if (!reading) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No sensor readings found for this device',
        });
      }

      res.json({
        success: true,
        data: reading.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/sensor/recent/:deviceId
   */
  getRecent = async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId;
      const limit = parseInt(req.query.limit || '100', 10);

      const readings = await this.queryService.getRecentReadings(deviceId, limit);

      res.json({
        success: true,
        data: readings.map(r => r.toJSON()),
        count: readings.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/sensor/dashboard/:deviceId
   */
  getDashboard = async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId;
      const summary = await this.queryService.getDashboardSummary(deviceId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };
}
