import mongoose from 'mongoose';

/**
 * MongoDB Schema: Alert
 * Stores system alerts triggered by threshold breaches or anomalies
 */
const alertSchema = new mongoose.Schema({
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
  severity: {
    type: String,
    required: true,
    enum: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  parameter: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  threshold: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  acknowledged: {
    type: Boolean,
    default: false,
    index: true,
  },
  acknowledgedBy: {
    type: String,
    default: null,
  },
  acknowledgedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: false,
});

// Compound indexes for querying
alertSchema.index({ deviceId: 1, timestamp: -1 });
alertSchema.index({ deviceId: 1, acknowledged: 1, severity: 1 });
alertSchema.index({ severity: 1, acknowledged: 1, timestamp: -1 });

// TTL index for retention (1 year)
alertSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export const Alert = mongoose.model('Alert', alertSchema);
