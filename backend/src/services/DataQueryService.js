import { SensorReadingRepository } from '../repositories/SensorReadingRepository.js';
import { AIEvaluationRepository } from '../repositories/AIEvaluationRepository.js';
import { AlertRepository } from '../repositories/AlertRepository.js';

/**
 * Service: Data Query
 * Handles data retrieval for dashboard and API endpoints
 */
export class DataQueryService {
  constructor() {
    this.sensorReadingRepo = new SensorReadingRepository();
    this.aiEvaluationRepo = new AIEvaluationRepository();
    this.alertRepo = new AlertRepository();
  }

  /**
   * Get latest sensor reading
   */
  async getLatestReading(deviceId) {
    return await this.sensorReadingRepo.getLatest(deviceId);
  }

  /**
   * Get latest AI evaluation
   */
  async getLatestEvaluation(deviceId) {
    return await this.aiEvaluationRepo.getLatest(deviceId);
  }

  /**
   * Get recent readings for charting
   */
  async getRecentReadings(deviceId, limit = 100) {
    return await this.sensorReadingRepo.getRecent(deviceId, limit);
  }

  /**
   * Get readings in time range
   */
  async getReadingsByTimeRange(deviceId, startTime, endTime, limit = 1000) {
    return await this.sensorReadingRepo.getByTimeRange(deviceId, startTime, endTime, limit);
  }

  /**
   * Get recent evaluations
   */
  async getRecentEvaluations(deviceId, limit = 50) {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    return await this.aiEvaluationRepo.getByTimeRange(deviceId, startTime, endTime, limit);
  }

  /**
   * Get unacknowledged alerts
   */
  async getUnacknowledgedAlerts(deviceId) {
    return await this.alertRepo.getUnacknowledged(deviceId);
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(deviceId, limit = 50) {
    return await this.alertRepo.getRecent(deviceId, limit);
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(deviceId) {
    const [latestReading, latestEvaluation, unacknowledgedAlerts] = await Promise.all([
      this.getLatestReading(deviceId),
      this.getLatestEvaluation(deviceId),
      this.getUnacknowledgedAlerts(deviceId),
    ]);

    return {
      deviceId,
      latestReading: latestReading ? latestReading.toJSON() : null,
      latestEvaluation: latestEvaluation ? latestEvaluation.toJSON() : null,
      unacknowledgedAlertCount: unacknowledgedAlerts.length,
      unacknowledgedAlerts: unacknowledgedAlerts.map(a => a.toJSON()),
    };
  }
}
