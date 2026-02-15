import React from 'react';
import './AIOpinionPanel.css';

const AIOpinionPanel = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="ai-opinion-panel">
        <p className="no-data">No AI evaluation available</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      EXCELLENT: '#28a745',
      GOOD: '#17a2b8',
      ACCEPTABLE: '#ffc107',
      POOR: '#fd7e14',
      CRITICAL: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  return (
    <div className="ai-opinion-panel">
      <div className="panel-header">
        <h3>AI Assessment</h3>
        <span className={getStatusBadgeClass(evaluation.status)} style={{ backgroundColor: getStatusColor(evaluation.status) }}>
          {evaluation.status}
        </span>
      </div>

      <div className="explanation">
        <p>{evaluation.explanation}</p>
      </div>

      {evaluation.reasoning && (
        <div className="reasoning">
          <h4>Detailed Analysis</h4>
          <div className="reasoning-grid">
            {Object.entries(evaluation.reasoning).map(([key, value]) => {
              if (key === 'trends') return null;
              return (
                <div key={key} className="reasoning-item">
                  <span className="reasoning-param">{key.toUpperCase()}</span>
                  <span className={`reasoning-status status-${value.status?.toLowerCase() || 'unknown'}`}>
                    {value.status || 'N/A'}
                  </span>
                  <span className="reasoning-value">{value.value?.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {evaluation.suggestedAction && (
        <div className="suggested-action">
          <h4>Recommended Action</h4>
          <p>{evaluation.suggestedAction}</p>
        </div>
      )}

      <div className="evaluation-meta">
        <span className="trigger-reason">Trigger: {evaluation.triggerReason}</span>
        <span className="evaluation-time">
          {new Date(evaluation.timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default AIOpinionPanel;
