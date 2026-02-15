import { SensorIngestionService } from '../services/SensorIngestionService.js';
import { DataQueryService } from '../services/DataQueryService.js';
import { logger } from '../config/logger.js';

/**
 * Controller: Sensor
 * Handles sensor-related HTTP requests
 */
export class SensorController {
  constructor() {
    this.ingestionService = new SensorIngestionService();
    this.queryService = new DataQueryService();
  }

  /**
   * POST /api/v1/sensor/ingest
   * Ingests sensor data from IoT device
   */
  ingest = async (req, res, next) => {
    try {
      const sensorData = req.body;
      const deviceId = sensorData.deviceId; // ✅ SOURCE OF TRUTH

      if (!deviceId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'deviceId is required in payload',
        });
      }

      const result = await this.ingestionService.ingestReading(sensorData, deviceId);

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
