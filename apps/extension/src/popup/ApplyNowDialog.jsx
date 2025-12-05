import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const ApplyNowDialog = ({ open, jobData, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [coverLetterGenerated, setCoverLetterGenerated] = useState(false);
  const [generateCoverLetter, setGenerateCoverLetter] = useState(true);
  const [autoFill, setAutoFill] = useState(true);

  const steps = [
    'Prepare Documents',
    'Auto-Fill Application',
    'Review & Submit',
  ];

  const handleGenerateDocuments = async () => {
    try {
      setGenerating(true);

      // Generate resume
      const resumeResponse = await chrome.runtime.sendMessage({
        action: 'GENERATE_RESUME',
        data: jobData,
      });

      if (resumeResponse.success) {
        setResumeGenerated(true);

        // Generate cover letter if requested
        if (generateCoverLetter) {
          const coverLetterResponse = await chrome.runtime.sendMessage({
            action: 'GENERATE_COVER_LETTER',
            data: jobData,
          });

          if (coverLetterResponse.success) {
            setCoverLetterGenerated(true);
          }
        }

        // Move to next step
        setActiveStep(1);
      }
    } catch (err) {
      console.error('[ApplyNowDialog] Document generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAutoFill = async () => {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send auto-fill message to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'AUTO_FILL_APPLICATION',
        data: {
          jobData,
          autoFill,
        },
      });

      // Move to next step
      setActiveStep(2);
    } catch (err) {
      console.error('[ApplyNowDialog] Auto-fill error:', err);
    }
  };

  const handleFinish = () => {
    // Track application
    chrome.runtime.sendMessage({
      action: 'TRACK_APPLICATION',
      data: {
        jobId: jobData.id,
        status: 'applied',
        appliedAt: new Date().toISOString(),
      },
    });

    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" paragraph>
              Let's prepare your application documents for this position.
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                We'll generate a tailored resume that highlights your relevant skills and experience.
              </Typography>
            </Alert>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={generateCoverLetter}
                    onChange={(e) => setGenerateCoverLetter(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Generate Cover Letter
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI-powered cover letter tailored to this job
                    </Typography>
                  </Box>
                }
              />

              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {resumeGenerated ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <AutoAwesomeIcon color="primary" fontSize="small" />
                    )}
                    <Typography variant="body2">
                      {resumeGenerated ? 'Resume ready' : 'Tailored Resume'}
                    </Typography>
                  </Stack>

                  {generateCoverLetter && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {coverLetterGenerated ? (
                        <CheckCircleIcon color="success" fontSize="small" />
                      ) : (
                        <AutoAwesomeIcon color="primary" fontSize="small" />
                      )}
                      <Typography variant="body2">
                        {coverLetterGenerated ? 'Cover letter ready' : 'Cover Letter'}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerateDocuments}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              >
                {generating ? 'Generating...' : 'Generate Documents'}
              </Button>
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✅ Documents generated successfully!
              </Typography>
            </Alert>

            <Typography variant="body2" paragraph>
              We can automatically fill in the application form with your information.
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={autoFill}
                  onChange={(e) => setAutoFill(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Enable Auto-Fill
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically populate form fields with your profile data
                  </Typography>
                </Box>
              }
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleAutoFill}
              sx={{ mt: 2 }}
            >
              Continue to Application
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Review the pre-filled application and upload your documents before submitting.
              </Typography>
            </Alert>

            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  bgcolor: 'success.lighter',
                }}
              >
                <Typography variant="body2" fontWeight={600} color="success.dark" paragraph>
                  📄 Documents Ready
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="caption">
                    • Tailored Resume
                  </Typography>
                  {generateCoverLetter && (
                    <Typography variant="caption">
                      • Cover Letter
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Typography variant="caption" color="text.secondary">
                💡 Tip: Double-check contact information and attach your documents before submitting.
              </Typography>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleFinish}
                color="success"
              >
                I'm Ready to Submit
              </Button>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Apply to {jobData?.company}</Typography>
        <Typography variant="caption" color="text.secondary">
          {jobData?.jobTitle}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        {activeStep > 0 && activeStep < 2 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApplyNowDialog;
