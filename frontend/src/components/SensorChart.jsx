import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import './SensorChart.css';

const SensorChart = ({ readings, parameter }) => {
  if (!readings || readings.length === 0) {
    return (
      <div className="sensor-chart">
        <p className="no-data">No data available for chart</p>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = readings.map(reading => ({
    time: format(new Date(reading.timestamp), 'HH:mm:ss'),
    value: reading[parameter],
  }));

  const getParameterLabel = (param) => {
    const labels = {
      pH: 'pH',
      tds: 'TDS (ppm)',
      turbidity: 'Turbidity (NTU)',
      temperature: 'Temperature (°C)',
      dissolvedOxygen: 'Dissolved Oxygen (mg/L)',
    };
    return labels[param] || param;
  };

  return (
    <div className="sensor-chart">
      <h4>{getParameterLabel(parameter)}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#007bff"
            strokeWidth={2}
            dot={false}
            name={getParameterLabel(parameter)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;
