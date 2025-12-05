import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const AutoFillConfirmation = ({ open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState([]);
  const [filling, setFilling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({
    skipOptional: false,
    skipDemographics: true,
    focusFirst: true,
  });

  useEffect(() => {
    if (open) {
      loadPreview();
    }
  }, [open]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'GET_AUTOFILL_PREVIEW',
      });

      if (response.success) {
        setPreview(response.data);
      } else {
        throw new Error(response.error || 'Failed to get preview');
      }
    } catch (error) {
      console.error('[AutoFillConfirmation] Error loading preview:', error);
      setPreview([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoFill = async () => {
    try {
      setFilling(true);
      setProgress(0);

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Simulate progress (since actual filling happens in content script)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'START_AUTOFILL',
        options,
      });

      clearInterval(progressInterval);
      setProgress(100);

      setResult(response);

      // Auto-close on success after 2 seconds
      if (response.success) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (error) {
      console.error('[AutoFillConfirmation] Error starting auto-fill:', error);
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setFilling(false);
    }
  };

  const handleCancel = () => {
    if (filling) {
      // Stop auto-fill
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        chrome.tabs.sendMessage(tab.id, { action: 'STOP_AUTOFILL' });
      });
    }
    onClose();
  };

  const getFieldIcon = (field) => {
    if (field.required && !field.willFill) {
      return <ErrorIcon color="error" fontSize="small" />;
    }
    if (field.willFill) {
      return <CheckCircleIcon color="success" fontSize="small" />;
    }
    return <WarningIcon color="warning" fontSize="small" />;
  };

  const getFieldsToFill = () => {
    return preview.filter(f => f.willFill);
  };

  const getRequiredMissing = () => {
    return preview.filter(f => f.required && !f.willFill);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Loading Form Data...</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Analyzing form fields...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (result) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {result.success ? '✅ Auto-Fill Complete!' : '❌ Auto-Fill Failed'}
        </DialogTitle>
        <DialogContent>
          {result.success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Successfully filled {result.filledCount} field{result.filledCount !== 1 ? 's' : ''}!
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              {result.error || 'An error occurred during auto-fill'}
            </Alert>
          )}

          {result.filledFields && result.filledFields.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Filled Fields:
              </Typography>
              <Stack spacing={0.5}>
                {result.filledFields.map((field, idx) => (
                  <Typography key={idx} variant="body2">
                    • {field.label || field.fieldName}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {result.errors && result.errors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Errors:
              </Typography>
              <Stack spacing={0.5}>
                {result.errors.map((err, idx) => (
                  <Typography key={idx} variant="body2" color="error">
                    • {err.label || err.fieldName}: {err.error}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const fieldsToFill = getFieldsToFill();
  const requiredMissing = getRequiredMissing();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          <Typography variant="h6">Auto-Fill Application Form</Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {filling && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Filling form... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {requiredMissing.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Missing Required Fields:
            </Typography>
            {requiredMissing.map((field, idx) => (
              <Typography key={idx} variant="body2">
                • {field.label}
              </Typography>
            ))}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Please complete your profile before auto-filling.
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {fieldsToFill.length} fields will be filled:
          </Typography>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip size="small" label={`${fieldsToFill.filter(f => f.required).length} required`} color="error" />
            <Chip size="small" label={`${fieldsToFill.filter(f => !f.required).length} optional`} />
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}></TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Value Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.slice(0, 10).map((field, idx) => (
                  <TableRow
                    key={idx}
                    sx={{
                      opacity: field.willFill ? 1 : 0.5,
                      bgcolor: field.required && !field.willFill ? 'error.lighter' : 'inherit',
                    }}
                  >
                    <TableCell>{getFieldIcon(field)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {field.label}
                        {field.required && <span style={{ color: 'red' }}> *</span>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {field.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={field.willFill ? 'text.primary' : 'text.secondary'}>
                        {field.willFill ? String(field.value).substring(0, 30) : '(no value)'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {preview.length > 10 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              ... and {preview.length - 10} more fields
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Options:
          </Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.skipOptional}
                  onChange={(e) => setOptions({ ...options, skipOptional: e.target.checked })}
                  disabled={filling}
                />
              }
              label="Skip optional fields (fill required only)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.skipDemographics}
                  onChange={(e) => setOptions({ ...options, skipDemographics: e.target.checked })}
                  disabled={filling}
                />
              }
              label="Skip demographic questions (gender, race, veteran status)"
            />
          </Stack>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            💡 <strong>Tip:</strong> The form will be filled automatically with human-like typing delays.
            Review the filled information before submitting.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} disabled={filling}>
          Cancel
        </Button>
        <Button
          onClick={handleStartAutoFill}
          variant="contained"
          disabled={filling || requiredMissing.length > 0}
          startIcon={filling ? null : <CheckCircleIcon />}
        >
          {filling ? 'Filling...' : `Fill ${fieldsToFill.length} Fields`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoFillConfirmation;
