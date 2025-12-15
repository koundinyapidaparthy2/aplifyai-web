import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import SmartPopup from './popup/SmartPopup';

// Create Material-UI theme matching the extension
const theme = createTheme({
  typography: {
    fontSize: 12,
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#3DCEA5', // Mint green - matches web app
      light: '#6CF3C3', // primary-300
      dark: '#117158', // primary-700
    },
    secondary: {
      main: '#1EB086', // primary-500
      light: '#6CF3C3', // primary-300
      dark: '#115A49', // primary-800
    },
    success: {
      main: '#48bb78',
      light: '#68d391',
      dark: '#38a169',
      lighter: '#f0fff4',
    },
    warning: {
      main: '#ed8936',
      light: '#f6ad55',
      dark: '#c05621',
    },
    error: {
      main: '#f56565',
      light: '#fc8181',
      dark: '#c53030',
    },
  },
});

// Render the popup
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SmartPopup />
    </ThemeProvider>
  </React.StrictMode>
);
