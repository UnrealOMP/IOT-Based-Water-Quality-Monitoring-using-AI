import api from '../config/api.js';

export const alertService = {
  /**
   * Get alerts
   */
  getAlerts: async (deviceId, options = {}) => {
    const response = await api.get(`/alerts/${deviceId || ''}`, {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: async (alertId) => {
    const response = await api.post(`/alerts/${alertId}/acknowledge`);
    return response.data.data;
  },
};
