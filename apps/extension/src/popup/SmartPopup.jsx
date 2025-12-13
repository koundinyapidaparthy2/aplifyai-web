import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  Stack,
  Alert,
  CircularProgress as MuiCircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Launch as LaunchIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import TabNav from './TabNav';
import ProfileTab from './ProfileTab';
import CircularProgress from './CircularProgress';
import VerticalStepper from './VerticalStepper';
import JobMatchScore from './JobMatchScore';
import QuickEditDialog from './QuickEditDialog';
import RecentResumes from './RecentResumes';
import ApplyNowDialog from './ApplyNowDialog';
import applicationFlowService from '../services/applicationFlow';

const SmartPopup = () => {
  // Data state
  const [jobData, setJobData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [recentResumes, setRecentResumes] = useState([]);
  const [error, setError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('autofill');
  const [showStepper, setShowStepper] = useState(false);
  const [applicationProgress, setApplicationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState({});
  const [stepErrors, setStepErrors] = useState({});

  useEffect(() => {
    initializePopup();

    // Subscribe to application flow updates
    const unsubscribe = applicationFlowService.subscribe((state) => {
      setApplicationProgress(state.progress);
      setCurrentStep(state.currentStep);
      setStepStatuses(state.stepStatuses);
      setStepErrors(state.errors);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Initialize popup by fetching job data and user profile
   */
  const initializePopup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Request job data from content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'GET_JOB_DATA',
      });

      if (!response.success) {
        throw new Error(response.error || 'No job detected on this page');
      }

      // Check if we actually have job data
      if (!response.data) {
        throw new Error('No job detected on this page');
      }

      setJobData(response.data);

      // Check if job is already saved
      const savedJobs = await chrome.storage.local.get(['detectedJobs']);
      const isSaved = savedJobs.detectedJobs?.some(job => job.url === response.data.url);
      setSaved(isSaved);

      // Get user profile
      const profileResponse = await chrome.runtime.sendMessage({
        action: 'GET_USER_PROFILE',
      });

      if (profileResponse.success) {
        setUserProfile(profileResponse.data);

        // Calculate match score
        const score = calculateMatchScore(response.data, profileResponse.data);
        setMatchScore(score);
      }

      // Get recent resumes for this company (only if company exists)
      if (response.data.company) {
        const resumesResponse = await chrome.runtime.sendMessage({
          action: 'GET_RECENT_RESUMES',
          data: { company: response.data.company },
        });

        if (resumesResponse.success) {
          setRecentResumes(resumesResponse.data || []);
        }
      }

    } catch (err) {
      console.error('[SmartPopup] Initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate match score between user profile and job requirements
   */
  const calculateMatchScore = (job, profile) => {
    if (!job || !profile) return null;

    const scores = {
      overall: 0,
      skills: 0,
      experience: 0,
      education: 0,
      location: 0,
    };

    // Skills match (40% weight)
    if (job.skills?.length && profile.skills?.length) {
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const userSkills = profile.skills.map(s => s.toLowerCase());
      const matchingSkills = jobSkills.filter(skill =>
        userSkills.some(us => us.includes(skill) || skill.includes(us))
      );
      scores.skills = (matchingSkills.length / jobSkills.length) * 100;
      scores.matchingSkills = matchingSkills;
      scores.missingSkills = jobSkills.filter(skill => !matchingSkills.includes(skill));
    }

    // Experience match (30% weight)
    if (job.seniorityLevel && profile.totalExperience) {
      const requiredYears = extractYearsFromSeniority(job.seniorityLevel);
      const userYears = profile.totalExperience;

      if (requiredYears) {
        scores.experience = Math.min((userYears / requiredYears) * 100, 100);
      } else {
        scores.experience = 75; // Default if can't determine
      }
    }

    // Education match (15% weight)
    if (job.description && profile.education?.length) {
      const degreeKeywords = ['bachelor', 'master', 'phd', 'doctorate', 'degree'];
      const jobRequiresDegree = degreeKeywords.some(kw =>
        job.description.toLowerCase().includes(kw)
      );
      scores.education = jobRequiresDegree && profile.education.length > 0 ? 100 : 50;
    }

    // Location match (15% weight)
    if (job.location && profile.location) {
      const jobRemote = job.remote || job.location.toLowerCase().includes('remote');
      const userRemote = profile.remotePreference;

      if (jobRemote && userRemote) {
        scores.location = 100;
      } else if (job.location.toLowerCase().includes(profile.location?.toLowerCase())) {
        scores.location = 100;
      } else {
        scores.location = 30;
      }
    }

    // Calculate weighted overall score
    scores.overall = (
      scores.skills * 0.4 +
      scores.experience * 0.3 +
      scores.education * 0.15 +
      scores.location * 0.15
    );

    return scores;
  };

  /**
   * Extract years of experience from seniority level
   */
  const extractYearsFromSeniority = (level) => {
    const levelMap = {
      'entry': 0,
      'junior': 1,
      'mid': 3,
      'senior': 5,
      'staff': 7,
      'principal': 10,
      'director': 12,
      'executive': 15,
    };

    const normalized = level.toLowerCase();
    for (const [key, years] of Object.entries(levelMap)) {
      if (normalized.includes(key)) {
        return years;
      }
    }
    return null;
  };

  /**
   * Handle generate resume
   */
  const handleGenerateResume = async (editedJobData = null) => {
    try {
      setGenerating(true);
      setError(null);

      const dataToUse = editedJobData || jobData;

      const response = await chrome.runtime.sendMessage({
        action: 'GENERATE_RESUME',
        data: dataToUse,
      });

      if (response.success) {
        // Show success message
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon-128.png'),
          title: 'Resume Generation Started',
          message: 'Your tailored resume is being generated. Check the dashboard for status.',
        });

        // Open dashboard
        window.open('index.html#/dashboard', '_blank');
      } else {
        throw new Error(response.error || 'Failed to generate resume');
      }

    } catch (err) {
      console.error('[SmartPopup] Generate resume error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Handle save job
   */
  const handleSaveJob = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'SAVE_JOB',
        data: jobData,
      });

      if (response.success) {
        setSaved(true);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icon-128.png'),
          title: 'Job Saved',
          message: `${jobData.jobTitle} at ${jobData.company} has been saved to your tracker.`,
        });
      }
    } catch (err) {
      console.error('[SmartPopup] Save job error:', err);
      setError(err.message);
    }
  };

  /**
   * Handle quick edit
   */
  const handleQuickEdit = () => {
    setEditDialogOpen(true);
  };

  /**
   * Handle edit save
   */
  const handleEditSave = (editedData) => {
    setJobData(editedData);
    setEditDialogOpen(false);

    // Recalculate match score
    if (userProfile) {
      const score = calculateMatchScore(editedData, userProfile);
      setMatchScore(score);
    }
  };

  /**
   * Handle apply now
   */
  const handleApplyNow = async () => {
    try {
      // Show stepper in UI
      setShowStepper(true);
      setActiveTab('autofill'); // Switch to autofill tab

      // Start application flow
      await applicationFlowService.startApplication(jobData, userProfile);

      // Show completion notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon-128.png'),
        title: 'Application Ready',
        message: 'Review the form and submit when ready!',
      });

    } catch (error) {
      console.error('[SmartPopup] Application flow error:', error);
      setError(error.message);

      // Reset stepper
      setShowStepper(false);
      applicationFlowService.reset();
    }
  };

  /**
   * Handle close popup
   */
  const handleClose = () => {
    window.close();
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  /**
   * Get match score color
   */
  const getMatchColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <MuiCircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Analyzing job posting...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button fullWidth variant="outlined" onClick={initializePopup}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!jobData) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          No job detected on this page. Navigate to a job posting on LinkedIn, Indeed, Greenhouse, Lever, or Workday.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header with Close Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', ml: 1 }}>
          AplifyAI
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#64748b' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onChange={handleTabChange} />

      {/* Tab Content */}
      {activeTab === 'profile' ? (
        <ProfileTab />
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Circular Progress Indicator */}
          {(generating || showStepper) && (
            <Box sx={{ position: 'absolute', top: 70, right: 16, zIndex: 10 }}>
              <CircularProgress progress={applicationProgress} size={60} />
            </Box>
          )}

          {/* Stepper */}
          {showStepper && (
            <VerticalStepper
              currentStep={currentStep}
              stepStatuses={stepStatuses}
              errors={stepErrors}
            />
          )}

          {!showStepper && (
            <>
              {/* Header with Match Score */}
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {jobData.jobTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {jobData.company}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={saved ? null : handleSaveJob}
                  >
                    {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Stack>

                {matchScore && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Match Score
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {Math.round(matchScore.overall)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={matchScore.overall}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: matchScore.overall >= 80 ? '#4caf50' : matchScore.overall >= 60 ? '#ff9800' : '#f44336',
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ p: 2 }}>
                {/* Job Details */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack spacing={1.5}>
                      {jobData.location && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {jobData.location}
                            {jobData.remote && (
                              <Chip label="Remote" size="small" color="success" sx={{ ml: 1, height: 20 }} />
                            )}
                          </Typography>
                        </Stack>
                      )}

                      {jobData.salary && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AttachMoneyIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            ${jobData.salary.min?.toLocaleString()} - ${jobData.salary.max?.toLocaleString()}
                            {jobData.salary.currency && ` ${jobData.salary.currency}`}
                          </Typography>
                        </Stack>
                      )}

                      {jobData.jobType && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <WorkIcon fontSize="small" color="action" />
                          <Typography variant="body2">{jobData.jobType}</Typography>
                        </Stack>
                      )}

                      {jobData.postedDate && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ScheduleIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {jobData.postedDate}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={handleQuickEdit}
                      sx={{ mt: 2 }}
                    >
                      Quick Edit
                    </Button>
                  </CardContent>
                </Card>

                {/* Match Score Details */}
                {matchScore && (
                  <JobMatchScore matchScore={matchScore} />
                )}

                {/* Action Buttons */}
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleGenerateResume()}
                    disabled={generating}
                    startIcon={generating ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                    sx={{ py: 1.5 }}
                  >
                    {generating ? 'Generating...' : 'Generate Tailored Resume'}
                  </Button>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleApplyNow}
                    >
                      Apply Now
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      endIcon={<LaunchIcon />}
                      onClick={() => window.open(jobData.applicationUrl, '_blank')}
                    >
                      View Job
                    </Button>
                  </Stack>
                </Stack>

                {/* Recent Resumes */}
                {recentResumes.length > 0 && (
                  <RecentResumes resumes={recentResumes} company={jobData.company} />
                )}
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Dialogs */}
      {/* Removed ApplyNowDialog - now using direct flow */}
      <QuickEditDialog
        open={editDialogOpen}
        jobData={jobData}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditSave}
      />
    </Box>
  );
};

export default SmartPopup;
