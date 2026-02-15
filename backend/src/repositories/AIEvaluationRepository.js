import { AIEvaluation as AIEvaluationModel } from '../database/models/AIEvaluation.js';
import { AIEvaluation as AIEvaluationDomain } from '../domain/models/AIEvaluation.js';

/**
 * Repository: AI Evaluation
 * Handles data persistence for AI evaluations
 */
export class AIEvaluationRepository {
  /**
   * Save an AI evaluation
   */
  async create(evaluation) {
    const doc = new AIEvaluationModel(evaluation.toJSON());
    const saved = await doc.save();
    return this._toDomain(saved);
  }

  /**
   * Get latest evaluation for a device
   */
  async getLatest(deviceId) {
    const doc = await AIEvaluationModel
      .findOne({ deviceId })
      .sort({ timestamp: -1 })
      .lean();
    
    return doc ? this._toDomain(doc) : null;
  }

  /**
   * Get evaluations within time range
   */
  async getByTimeRange(deviceId, startTime, endTime, limit = 100) {
    const docs = await AIEvaluationModel
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
   * Convert database document to domain model
   */
  _toDomain(doc) {
    return new AIEvaluationDomain({
      deviceId: doc.deviceId,
      timestamp: doc.timestamp,
      status: doc.status,
      explanation: doc.explanation,
      reasoning: doc.reasoning,
      suggestedAction: doc.suggestedAction,
      confidence: doc.confidence,
      triggerReason: doc.triggerReason,
    });
  }
}
