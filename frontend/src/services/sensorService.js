import axios from 'axios';
import { API_BASE_URL, getApiKey } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

export const sensorService = {
  getDashboardSummary: async (deviceId) => {
    const res = await api.get(`/sensor/dashboard/${deviceId}`);
    return res.data.data;
  },

  getRecentReadings: async (deviceId, limit = 50) => {
    const res = await api.get(`/sensor/recent/${deviceId}?limit=${limit}`);
    return res.data.data;
  },

  getLatestReading: async (deviceId) => {
  const res = await api.get(`/sensor/latest/${deviceId}`);
  return res.data.data;
},

};
