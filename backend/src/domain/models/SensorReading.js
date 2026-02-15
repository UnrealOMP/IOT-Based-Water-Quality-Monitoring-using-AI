/**
 * Domain Model: Sensor Reading
 * Represents a single sensor data point from IoT device
 */
export class SensorReading {
  constructor({
    deviceId,
    timestamp,
    pH,
    tds,
    turbidity,
    temperature,
    dissolvedOxygen = null,
    metadata = {},
  }) {
    this.deviceId = deviceId;
    this.timestamp = timestamp || new Date();
    this.pH = pH;
    this.tds = tds;
    this.turbidity = turbidity;
    this.temperature = temperature;
    this.dissolvedOxygen = dissolvedOxygen;
    this.metadata = metadata;
  }

  validate() {
    const errors = [];
    
    if (!this.deviceId) errors.push('deviceId is required');
    if (this.pH === undefined || this.pH === null) errors.push('pH is required');
    if (this.tds === undefined || this.tds === null) errors.push('TDS is required');
    if (this.turbidity === undefined || this.turbidity === null) errors.push('turbidity is required');
    if (this.temperature === undefined || this.temperature === null) errors.push('temperature is required');
    
    // Range validations
    if (this.pH < 0 || this.pH > 14) errors.push('pH must be between 0 and 14');
    if (this.tds < 0) errors.push('TDS must be non-negative');
    if (this.turbidity < 0) errors.push('turbidity must be non-negative');
    if (this.temperature < -50 || this.temperature > 100) errors.push('temperature out of valid range');
    
    return errors;
  }

  toJSON() {
    return {
      deviceId: this.deviceId,
      timestamp: this.timestamp,
      pH: this.pH,
      tds: this.tds,
      turbidity: this.turbidity,
      temperature: this.temperature,
      dissolvedOxygen: this.dissolvedOxygen,
      metadata: this.metadata,
    };
  }
}
