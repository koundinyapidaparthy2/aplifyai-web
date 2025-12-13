import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { AutoFixHigh as AutofillIcon, Person as PersonIcon } from '@mui/icons-material';

const TabNav = ({ activeTab, onChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
      <Tabs
        value={activeTab}
        onChange={onChange}
        variant="fullWidth"
        sx={{
          minHeight: 48,
          '& .MuiTabs-indicator': {
            backgroundColor: '#3DCEA5',
            height: 3,
          },
        }}
      >
        <Tab
          icon={<AutofillIcon />}
          iconPosition="start"
          label="Autofill"
          value="autofill"
          sx={{
            minHeight: 48,
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: '#3DCEA5',
              fontWeight: 600,
            },
            '& .MuiSvgIcon-root': {
              fontSize: '18px',
            },
          }}
        />
        <Tab
          icon={<PersonIcon />}
          iconPosition="start"
          label="Profile"
          value="profile"
          sx={{
            minHeight: 48,
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: '#3DCEA5',
              fontWeight: 600,
            },
            '& .MuiSvgIcon-root': {
              fontSize: '18px',
            },
          }}
        />
      </Tabs>
    </Box>
  );
};

export default TabNav;
