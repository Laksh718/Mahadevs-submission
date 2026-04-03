import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastDetail {
  date: string;
  rainfall_mm: number;
  confidence: number;
  risk_level: string;
}

interface ForecastChartProps {
  data: ForecastDetail[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="rainfall_mm" stroke="#8884d8" strokeWidth={2} name="Daily Rainfall Forecast (mm)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;