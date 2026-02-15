import { Device } from '../database/models/Device.js';

/**
 * Repository: Device
 * Handles device management
 */
export class DeviceRepository {
  /**
   * Find device by API key
   */
  async findByApiKey(apiKey) {
    const doc = await Device.findOne({ apiKey, isActive: true }).lean();
    return doc;
  }

  /**
   * Update device last seen timestamp
   */
  async updateLastSeen(deviceId) {
    await Device.updateOne(
      { deviceId },
      { lastSeen: new Date() }
    );
  }

  /**
   * Get all active devices
   */
  async getAllActive() {
    const docs = await Device.find({ isActive: true }).lean();
    return docs;
  }

  /**
   * Create a new device
   */
  async create(deviceData) {
    const doc = new Device(deviceData);
    return await doc.save();
  }
}
