import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ApiStatus = ({ response, lastUpdated }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', bgcolor: '#1a1b25', color: 'white' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>API Response Status</Typography>
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'rgba(255,255,255,0.1)', 
          borderRadius: 2,
          fontFamily: 'monospace',
          mb: 2,
          minHeight: '100px',
          wordBreak: 'break-all'
        }}
      >
        {response || '等待交易...'}
      </Box>
      <Box sx={{ color: '#a0a3c4' }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>API 端点:</strong> http://localhost:3006
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>状态:</strong> 已连接
        </Typography>
        <Typography variant="body2">
          <strong>最后更新:</strong> {lastUpdated}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ApiStatus;