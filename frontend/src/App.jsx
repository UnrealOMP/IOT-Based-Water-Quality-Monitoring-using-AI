import React, { useState, useEffect, useCallback } from 'react';
import { sensorService } from './services/sensorService';
import { liveDataService, liveDataToChartReading } from './services/liveDataService';
import { setApiKey } from './config/api';

import LiveSensorData from './components/LiveSensorData';
import AIOpinionPanel from './components/AIOpinionPanel';
import AlertTimeline from './components/AlertTimeline';
import SensorChart from './components/SensorChart';

import './App.css';

const DEVICE_ID = 'HARDWARE_DEVICE_001';
const MAX_CHART_POINTS = 50;
const AI_REFRESH_MS = 30000;

function App() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKey, setApiKeyState] = useState(localStorage.getItem('apiKey') || '');

  const [latestReading, setLatestReading] = useState(null);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLiveUpdate = useCallback((liveData) => {
    setLatestReading(liveData);
    setRecentReadings((prev) => {
      const next = [...prev, liveDataToChartReading(liveData)];
      return next.slice(-MAX_CHART_POINTS);
    });
  }, []);

  useEffect(() => {
    if (!apiKey) return;
    setApiKey(apiKey);
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  const fetchDashboardData = async () => {
    if (!apiKey) return;

    setLoading(true);
    setError(null);

    try {
      const summary = await sensorService.getDashboardSummary(DEVICE_ID);

      setLatestEvaluation(summary?.latestEvaluation || null);
      setAlerts(summary?.unacknowledgedAlerts || []);

      const readings = await sensorService.getRecentReadings(DEVICE_ID, MAX_CHART_POINTS);
      if (readings?.length) {
        setRecentReadings(readings);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch AI and alert data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadLiveData = async () => {
      try {
        const liveData = await liveDataService.fetchLiveData();
        if (!cancelled) {
          handleLiveUpdate(liveData);
        }
      } catch (err) {
        console.error('Failed to fetch live data', err);
      }
    };

    loadLiveData();
    const disconnectSocket = liveDataService.connectLiveSocket((liveData) => {
      if (!cancelled) {
        handleLiveUpdate(liveData);
      }
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [handleLiveUpdate]);

  useEffect(() => {
    if (!apiKey) return;
    fetchDashboardData();
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) return;

    const interval = setInterval(fetchDashboardData, AI_REFRESH_MS);
    return () => clearInterval(interval);
  }, [apiKey]);

  const handleConnect = () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter API key');
      return;
    }

    setApiKeyState(apiKeyInput.trim());
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Water Quality Monitoring Platform</h1>

        <div className="api-key-input">
          <input
            type="text"
            placeholder="Enter API Key (for AI & alerts)"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
          />
          <button onClick={handleConnect}>Connect</button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {loading && apiKey && <div className="loading">Loading AI data...</div>}

      <main className="dashboard">
        <div className="dashboard-grid">
          <div className="dashboard-left">
            <LiveSensorData reading={latestReading} />
            {apiKey ? (
              <AIOpinionPanel evaluation={latestEvaluation} />
            ) : (
              <div className="ai-opinion-panel">
                <p className="no-data">Enter API key to view AI assessment and alerts</p>
              </div>
            )}
          </div>

          <div className="dashboard-right">
            {apiKey ? (
              <AlertTimeline alerts={alerts} />
            ) : (
              <div className="alert-timeline">
                <h3>Alerts</h3>
                <p className="no-alerts">Connect with API key to view alerts</p>
              </div>
            )}
          </div>
        </div>

        <div className="charts-section">
          <h2>Historical Trends</h2>
          <div className="charts-grid">
            <SensorChart readings={recentReadings} parameter="pH" />
            <SensorChart readings={recentReadings} parameter="tds" />
            <SensorChart readings={recentReadings} parameter="turbidity" />
            <SensorChart readings={recentReadings} parameter="temperature" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
