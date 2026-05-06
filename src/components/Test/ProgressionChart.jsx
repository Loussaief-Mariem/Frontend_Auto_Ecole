import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
} from 'recharts';
import { Box, Typography } from '@mui/material';

const ProgressionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="textSecondary">Aucune donnée de progression disponible.</Typography>
      </Box>
    );
  }

  // Format dates for display
  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1e88e5" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#1e88e5" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="displayDate" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 11 }}
          dy={10}
        />
        <YAxis 
          domain={[0, 100]} 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 11 }}
          dx={-5}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '10px'
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
        />
        <Area 
          type="monotone" 
          dataKey="score" 
          stroke="#1e88e5" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorScore)" 
          name="Score (%)"
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ProgressionChart;
