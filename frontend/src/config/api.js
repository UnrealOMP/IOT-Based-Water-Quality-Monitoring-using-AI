// src/config/api.js

export const DEMO_MODE = false;

export const API_BASE_URL = "http://10.44.57.26:3001/api/v1";

let API_KEY = null;

export const setApiKey = (key) => {
  API_KEY = key;
};

export const getApiKey = () => API_KEY;
