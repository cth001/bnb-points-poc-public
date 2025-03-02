import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const ApiDoc = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Paper className="data-card" style={{ marginBottom: '24px' }}>
        <Typography variant="h4" gutterBottom>Points Management System API</Typography>
        <Typography variant="subtitle1">Base URL: http://localhost:3000/api</Typography>
      </Paper>

      {/* Create Wallet API */}
      <Paper className="data-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Create Wallet</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" component="div">
            <strong>URL:</strong> /wallet/create<br />
            <strong>Method:</strong> POST<br />
            <strong>Request Body:</strong> None
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom>Success Response (200)</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`{
  "success": true,
  "data": {
    "address": "0x...",
    "privateKey": "0x...",
    "mnemonic": "word1 word2 ..."
  }
}`}
        </pre>
      </Paper>

      {/* Mint Points API */}
      <Paper className="data-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Mint Points</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" component="div">
            <strong>URL:</strong> /points/mint<br />
            <strong>Method:</strong> POST
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom>Request Body</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
{`{
  "address": "0x...",
  "amount": "100"
}`}
        </pre>

        <Typography variant="h6" gutterBottom>Success Response (200)</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`{
  "success": true,
  "data": {
    "txHash": "0x...",
    "address": "0x...",
    "amount": "100"
  }
}`}
        </pre>
      </Paper>

      {/* Transfer Points API */}
      <Paper className="data-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Transfer Points</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" component="div">
            <strong>URL:</strong> /points/transfer<br />
            <strong>Method:</strong> POST
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom>Request Body</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
{`{
  "fromPrivateKey": "0x...",
  "toAddress": "0x...",
  "amount": "50"
}`}
        </pre>

        <Typography variant="h6" gutterBottom>Success Response (200)</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`{
  "success": true,
  "data": {
    "txHash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "50"
  }
}`}
        </pre>
      </Paper>

      {/* Get Balance API */}
      <Paper className="data-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Get Points Balance</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" component="div">
            <strong>URL:</strong> /points/balance/:address<br />
            <strong>Method:</strong> GET<br />
            <strong>URL Parameters:</strong> address=[ethereum address]
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom>Success Response (200)</Typography>
        <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
{`{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": "150"
  }
}`}
        </pre>
      </Paper>

      {/* Rate Limiting */}
      <Paper className="data-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <Typography variant="h5" gutterBottom>Rate Limiting</Typography>
        <Typography variant="body1">
          • Window: 15 minutes<br />
          • Max Requests: 100 per IP
        </Typography>
      </Paper>
    </div>
  );
};

export default ApiDoc;