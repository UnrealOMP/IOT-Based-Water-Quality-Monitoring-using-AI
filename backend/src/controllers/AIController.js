import { DataQueryService } from '../services/DataQueryService.js';

/**
 * Controller: AI
 * Handles AI evaluation-related requests
 */
export class AIController {
  constructor() {
    this.queryService = new DataQueryService();
  }

  /**
   * GET /api/v1/ai/latest
   * Get latest AI evaluation
   */
  getLatest = async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId || req.deviceId;
      const evaluation = await this.queryService.getLatestEvaluation(deviceId);

      if (!evaluation) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'No AI evaluation found for this device',
        });
      }

      res.json({
        success: true,
        data: evaluation.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/ai/recent
   * Get recent AI evaluations
   */
  getRecent = async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId || req.deviceId;
      const limit = parseInt(req.query.limit || '50', 10);
      
      const evaluations = await this.queryService.getRecentEvaluations(deviceId, limit);

      res.json({
        success: true,
        data: evaluations.map(e => e.toJSON()),
        count: evaluations.length,
      });
    } catch (error) {
      next(error);
    }
  };
}
