import React from 'react';
import { Paper, Typography, Box, Link } from '@mui/material';

const TransactionHistory = ({ transactions }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', bgcolor: '#1a1b25', color: 'white' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Transaction Status</Typography>
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {transactions.map((tx, index) => (
          <Box 
            key={index}
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              '&:last-child': { mb: 0 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {tx.chain.toUpperCase()}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: tx.status === 'success' ? '#52c41a' : '#f5222d',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                • {tx.status.toUpperCase()}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>{tx.message}</Typography>
            {tx.hash && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ color: '#a0a3c4', mb: 1 }}>
                  Transaction Hash: {tx.hash}
                </Typography>
                <Link
                  href={tx.explorer}
                  target="_blank"
                  rel="noopener"
                  sx={{ 
                    color: '#4a90e2',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  View on Explorer
                </Link>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default TransactionHistory;