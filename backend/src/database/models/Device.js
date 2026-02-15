import mongoose from 'mongoose';

/**
 * MongoDB Schema: Device
 * Tracks IoT devices and their status
 */
const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    default: 'Unnamed Device',
  },
  location: {
    type: String,
    default: null,
  },
  apiKey: {
    type: String,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeen: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

export const Device = mongoose.model('Device', deviceSchema);
