import React from 'react';
import './AlertTimeline.css';

const AlertTimeline = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-timeline">
        <h3>Alerts</h3>
        <p className="no-alerts">No alerts</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      INFO: '#17a2b8',
      LOW: '#28a745',
      MEDIUM: '#ffc107',
      HIGH: '#fd7e14',
      CRITICAL: '#dc3545',
    };
    return colors[severity] || '#6c757d';
  };

  return (
    <div className="alert-timeline">
      <h3>Recent Alerts</h3>
      <div className="alert-list">
        {alerts.slice(0, 10).map((alert) => (
          <div
            key={alert._id || alert.timestamp}
            className={`alert-item ${alert.acknowledged ? 'acknowledged' : ''}`}
            style={{ borderLeftColor: getSeverityColor(alert.severity) }}
          >
            <div className="alert-header">
              <span className="alert-severity" style={{ color: getSeverityColor(alert.severity) }}>
                {alert.severity}
              </span>
              <span className="alert-time">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="alert-title">{alert.title}</div>
            <div className="alert-message">{alert.message}</div>
            {alert.acknowledged && (
              <div className="alert-acknowledged">
                Acknowledged by {alert.acknowledgedBy}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertTimeline;
