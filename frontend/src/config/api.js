// src/config/api.js

export const DEMO_MODE = false;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const LIVE_DATA_URL =
  import.meta.env.VITE_LIVE_DATA_URL || 'http://localhost:3001/api/live-data';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let API_KEY = null;

export const setApiKey = (key) => {
  API_KEY = key;
};

export const getApiKey = () => API_KEY;
