import api from '../config/api.js';

export const aiService = {
  /**
   * Get latest AI evaluation
   */
  getLatestEvaluation: async (deviceId) => {
    const response = await api.get(`/ai/latest/${deviceId || ''}`);
    return response.data.data;
  },

  /**
   * Get recent AI evaluations
   */
  getRecentEvaluations: async (deviceId, limit = 50) => {
    const response = await api.get(`/ai/recent/${deviceId || ''}`, {
      params: { limit },
    });
    return response.data.data;
  },
};
