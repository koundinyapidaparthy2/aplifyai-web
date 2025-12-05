import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Box, Tabs, Tab, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz';

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    'aria-controls': `nav-tabpanel-${index}`,
  };
}

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Sync tab value with route
  useEffect(() => {
    if (location.pathname.includes('questions')) setTabValue(1);
    else setTabValue(0);
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    navigate(newValue === 1 ? '/questions' : '/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="sm">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Navigation Tabs"
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': { height: 3, borderRadius: 1 },
              '& .MuiTab-root': { minHeight: 'auto', py: 1 },
            }}
          >
            <Tab icon={<HomeIcon />} aria-label="Home" {...a11yProps(0)} />
            <Tab icon={<QuizIcon />} aria-label="Questions" {...a11yProps(1)} />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="sm">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
