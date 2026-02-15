import React, { useState, useEffect } from 'react';
import { sensorService } from './services/sensorService';
import { setApiKey } from './config/api';

import LiveSensorData from './components/LiveSensorData';
import AIOpinionPanel from './components/AIOpinionPanel';
import AlertTimeline from './components/AlertTimeline';
import SensorChart from './components/SensorChart';

import './App.css';

function App() {
  const DEVICE_ID = 'HARDWARE_DEVICE_001';

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKey, setApiKeyState] = useState(localStorage.getItem('apiKey') || '');

  const [latestReading, setLatestReading] = useState(null);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- API KEY SYNC ---------------- */
  useEffect(() => {
    if (!apiKey) return;

    setApiKey(apiKey);
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  /* ---------------- DATA FETCH ---------------- */
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const summary = await sensorService.getDashboardSummary(DEVICE_ID);
      console.log("DASHBOARD SUMMARY RAW:", summary);


      setLatestReading(summary?.latestReading || null);
      setLatestEvaluation(summary?.latestEvaluation || null);
      setAlerts(summary?.unacknowledgedAlerts || []);

      const readings = await sensorService.getRecentReadings(DEVICE_ID, 50);
      setRecentReadings(readings || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH AFTER CONNECT ---------------- */
  // Full dashboard load ONCE
useEffect(() => {
  if (!apiKey) return;
  fetchDashboardData();
}, [apiKey]);

// Light auto-refresh (values only)
// Light auto-refresh (values only)
useEffect(() => {
  if (!apiKey) return;

  const interval = setInterval(async () => {
    try {
      const latest = await sensorService.getLatestReading(DEVICE_ID);

      setLatestReading(prev => {
        if (!prev) return latest;
        if (JSON.stringify(prev) === JSON.stringify(latest)) return prev;
        return latest;
      });
    } catch (err) {
      console.error('Light refresh failed', err);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [apiKey]);



  /* ---------------- CONNECT HANDLER ---------------- */
  const handleConnect = () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter API key');
      return;
    }

    setApiKeyState(apiKeyInput.trim());
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Water Quality Monitoring Platform</h1>

        <div className="api-key-input">
          <input
            type="text"
            placeholder="Enter API Key"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
          />
          <button onClick={handleConnect}>Connect</button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {!apiKey && (
        <div className="welcome-message">
          <h2>Welcome</h2>
          <p>Please enter your device API key to view live sensor data.</p>
        </div>
      )}

      {apiKey && !loading && (
        <main className="dashboard">
          <div className="dashboard-grid">
            <div className="dashboard-left">
              <LiveSensorData reading={latestReading} />
              <AIOpinionPanel evaluation={latestEvaluation} />
            </div>

            <div className="dashboard-right">
              <AlertTimeline alerts={alerts} />
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
      )}
    </div>
  );
}

export default App;
