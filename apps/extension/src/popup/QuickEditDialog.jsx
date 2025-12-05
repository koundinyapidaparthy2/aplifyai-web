import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const QuickEditDialog = ({ open, jobData, onClose, onSave }) => {
  const [editedData, setEditedData] = useState(null);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (open && jobData) {
      setEditedData({ ...jobData });
    }
  }, [open, jobData]);

  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value,
      },
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditedData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditedData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const handleSave = () => {
    onSave(editedData);
  };

  if (!editedData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Job Details</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Job Title */}
          <TextField
            label="Job Title"
            value={editedData.jobTitle || ''}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            fullWidth
            size="small"
          />

          {/* Company */}
          <TextField
            label="Company"
            value={editedData.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            fullWidth
            size="small"
          />

          {/* Location */}
          <TextField
            label="Location"
            value={editedData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            fullWidth
            size="small"
            helperText="Use 'Remote' for remote positions"
          />

          {/* Job Type */}
          <TextField
            label="Job Type"
            value={editedData.jobType || ''}
            onChange={(e) => handleChange('jobType', e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g., Full-time, Part-time, Contract"
          />

          {/* Salary */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Salary Range
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Min"
                type="number"
                value={editedData.salary?.min || ''}
                onChange={(e) => handleSalaryChange('min', parseInt(e.target.value))}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                label="Max"
                type="number"
                value={editedData.salary?.max || ''}
                onChange={(e) => handleSalaryChange('max', parseInt(e.target.value))}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Stack>
          </Box>

          {/* Skills */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Required Skills
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                size="small"
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
              >
                <AddIcon />
              </Button>
            </Stack>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {editedData.skills?.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Description */}
          <TextField
            label="Job Description"
            value={editedData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={4}
            fullWidth
            size="small"
            helperText={`${editedData.description?.length || 0} characters`}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickEditDialog;
