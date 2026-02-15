/**
 * Domain Model: AI Evaluation
 * Represents the AI engine's assessment of water quality
 */
export class AIEvaluation {
  constructor({
    deviceId,
    timestamp,
    status,
    explanation,
    reasoning,
    suggestedAction,
    confidence,
    triggerReason,
  }) {
    this.deviceId = deviceId;
    this.timestamp = timestamp || new Date();
    this.status = status; // EXCELLENT, GOOD, ACCEPTABLE, POOR, CRITICAL
    this.explanation = explanation; // Human-readable summary
    this.reasoning = reasoning; // Detailed breakdown per parameter
    this.suggestedAction = suggestedAction || null;
    this.confidence = confidence || 1.0;
    this.triggerReason = triggerReason; // Why this evaluation was generated
  }

  toJSON() {
    return {
      deviceId: this.deviceId,
      timestamp: this.timestamp,
      status: this.status,
      explanation: this.explanation,
      reasoning: this.reasoning,
      suggestedAction: this.suggestedAction,
      confidence: this.confidence,
      triggerReason: this.triggerReason,
    };
  }
}
