import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', cost: 1800, forecast: 2000 },
  { name: 'Feb', cost: 2100, forecast: 2200 },
  { name: 'Mar', cost: 1950, forecast: 2100 },
  { name: 'Apr', cost: 2400, forecast: 2300 },
  { name: 'May', cost: 2450, forecast: 2500 },
  { name: 'Jun', cost: null, forecast: 2800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontWeight: 600, marginBottom: '8px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontSize: '0.875rem' }}>
            {entry.name}: ₹{entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CostChart = () => {
  return (
    <div className="glass-card" style={{ padding: '24px', height: '400px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Cost Trends & Forecast</h3>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
            Actual Spend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
            Forecast
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px', minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="var(--text-secondary)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="cost" 
              name="Actual Spend"
              stroke="var(--accent-blue)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCost)" 
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              name="Forecast"
              stroke="var(--accent-purple)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1} 
              fill="url(#colorForecast)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostChart;
