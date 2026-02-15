import mongoose from 'mongoose';

/**
 * MongoDB Schema: AI Evaluation
 * Stores AI engine assessments (event-driven, not sample-driven)
 */
const aiEvaluationSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ['EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR', 'CRITICAL'],
    index: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  reasoning: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  suggestedAction: {
    type: String,
    default: null,
  },
  confidence: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 1,
  },
  triggerReason: {
    type: String,
    required: true,
  },
}, {
  timestamps: false,
});

// Compound index for queries
aiEvaluationSchema.index({ deviceId: 1, timestamp: -1 });
aiEvaluationSchema.index({ deviceId: 1, status: 1, timestamp: -1 });

// TTL index for retention (1 year)
aiEvaluationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export const AIEvaluation = mongoose.model('AIEvaluation', aiEvaluationSchema);
