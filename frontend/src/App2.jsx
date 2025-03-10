import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, Paper, Snackbar, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import './styles.css';
import MultiChainTransfer from './components/MultiChainTransfer';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#f0f2f5',
      paper: '#1a1b25'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
});

const App2 = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="xl">
          <MultiChainTransfer />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;