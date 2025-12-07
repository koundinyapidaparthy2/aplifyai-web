import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './routes/routes';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#128d6b" },
    secondary: { main: "#3dcea5" },
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 12, // Reduced base font size
    button: { textTransform: "none", fontWeight: 600, fontSize: 12 }, // Adjusted button font size
  },
  shape: { borderRadius: 3 },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: { maxWidth: '100%', padding: '0 8px' }, // Reduced container padding
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 8, padding: "8px" }, // Reduced paper padding and border radius
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", margin: "dense" },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 6 }, // Smaller border radius
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, textTransform: 'none', fontWeight: 500, padding: '6px 12px' }, // Smaller border radius and padding
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 0,
          minHeight: 0,
          padding: '4px 6px', // Reduced padding
          fontSize: '0.75rem', // Smaller font size for tabs
          '&.Mui-selected': { color: '#128d6b', fontWeight: 500 },
        },
        iconWrapper: {
          margin: 0,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        textarea: {
          fontSize: "0.8rem", // Reduced textarea font size
          fontFamily: '"Inter", "Roboto", sans-serif',
          borderRadius: 6, // Smaller border radius
          border: "1px solid #ccc",
          padding: "6px 8px", // Reduced padding
          resize: "vertical",
          minHeight: 60, // Reduced min-height
          "&:focus": {
            borderColor: "#128d6b",
            outline: "none",
            boxShadow: "0 0 0 2px rgba(18, 141, 107, 0.3)",
          },
        },
      },
    },
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
