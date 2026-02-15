/**
 * Domain Model: Alert
 * Represents a system alert triggered by threshold breach or anomaly
 */
export class Alert {
  constructor({
    deviceId,
    timestamp,
    severity,
    title,
    message,
    parameter,
    value,
    threshold,
    acknowledged = false,
    acknowledgedBy = null,
    acknowledgedAt = null,
  }) {
    this.deviceId = deviceId;
    this.timestamp = timestamp || new Date();
    this.severity = severity; // INFO, LOW, MEDIUM, HIGH, CRITICAL
    this.title = title;
    this.message = message;
    this.parameter = parameter; // pH, tds, turbidity, temperature, etc.
    this.value = value;
    this.threshold = threshold;
    this.acknowledged = acknowledged;
    this.acknowledgedBy = acknowledgedBy;
    this.acknowledgedAt = acknowledgedAt;
  }

  toJSON() {
    return {
      deviceId: this.deviceId,
      timestamp: this.timestamp,
      severity: this.severity,
      title: this.title,
      message: this.message,
      parameter: this.parameter,
      value: this.value,
      threshold: this.threshold,
      acknowledged: this.acknowledged,
      acknowledgedBy: this.acknowledgedBy,
      acknowledgedAt: this.acknowledgedAt,
    };
  }
}
