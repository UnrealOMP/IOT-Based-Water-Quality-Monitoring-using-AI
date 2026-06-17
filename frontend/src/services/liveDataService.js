import axios from 'axios';
import { io } from 'socket.io-client';
import { LIVE_DATA_URL, SOCKET_URL } from '../config/api';

export const liveDataService = {
  fetchLiveData: async () => {
    const res = await axios.get(LIVE_DATA_URL);
    return res.data;
  },

  connectLiveSocket: (onUpdate) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('sensor-update', onUpdate);

    return () => {
      socket.off('sensor-update', onUpdate);
      socket.disconnect();
    };
  },
};

export function liveDataToChartReading(liveData) {
  return {
    pH: liveData.ph,
    tds: liveData.tds,
    turbidity: liveData.turbidity,
    temperature: liveData.temperature,
    timestamp: new Date().toISOString(),
  };
}
