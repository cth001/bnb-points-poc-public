import React from 'react';
import { 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Box,
  Typography 
} from '@mui/material';
import MultiChainTransfer from './components/MultiChainTransfer';
import './styles.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#f0f2f5',
      paper: '#1a1b25'
    }
  }
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h3" sx={{ mb: 4, color: '#1a1b25', fontWeight: 'bold' }}>
            Cross Chain Reward Points System
          </Typography>
          <MultiChainTransfer />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;