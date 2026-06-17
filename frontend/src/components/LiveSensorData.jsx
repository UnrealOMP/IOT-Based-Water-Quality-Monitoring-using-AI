import React from 'react';
import './LiveSensorData.css';

const LiveSensorData = ({ reading }) => {
  if (!reading) {
    return (
      <div className="live-sensor-data">
        <p className="no-data">No sensor data available</p>
      </div>
    );
  }

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return 'N/A';
    return `${Number(value).toFixed(2)} ${unit}`.trim();
  };

  const formatTimestamp = (timestamp) => {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime()) && String(timestamp).length > 8) {
      return parsed.toLocaleString();
    }
    return String(timestamp);
  };

  const ph = reading.ph ?? reading.pH;

  return (
    <div className="live-sensor-data">
      <h3>Live Sensor Data</h3>
      <div className="sensor-grid">
        <div className="sensor-item">
          <span className="sensor-label">pH</span>
          <span className="sensor-value">{formatValue(ph, '')}</span>
        </div>
        <div className="sensor-item">
          <span className="sensor-label">TDS</span>
          <span className="sensor-value">{formatValue(reading.tds, 'ppm')}</span>
        </div>
        <div className="sensor-item">
          <span className="sensor-label">Turbidity</span>
          <span className="sensor-value">{formatValue(reading.turbidity, 'NTU')}</span>
        </div>
        <div className="sensor-item">
          <span className="sensor-label">Temperature</span>
          <span className="sensor-value">{formatValue(reading.temperature, '°C')}</span>
        </div>
      </div>
      <div className="timestamp">
        Last updated: {formatTimestamp(reading.timestamp)}
      </div>
    </div>
  );
};

export default LiveSensorData;
