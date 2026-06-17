import mongoose from 'mongoose';

/**
 * MongoDB Schema: Sensor Reading (Time-series optimized)
 * Stores raw sensor data with high write throughput
 */
const sensorReadingSchema = new mongoose.Schema({
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
  pH: {
    type: Number,
    required: true,
    min: 0,
    max: 14,
  },
  tds: {
    type: Number,
    required: true,
    min: 0,
  },
  turbidity: {
    type: Number,
    required: true,
    min: 0,
  },
  temperature: {
    type: Number,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: false, // We use custom timestamp field
});

// Compound index for time-series queries (deviceId + timestamp)
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

// TTL index for automatic data retention (1 year = 365 days)
sensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);
