import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

const RecentResumes = ({ resumes, company }) => {
  if (!resumes || resumes.length === 0) return null;

  const handleDownload = async (resumeId) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'DOWNLOAD_RESUME',
        data: { resumeId },
      });

      if (response.success && response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (err) {
      console.error('[RecentResumes] Download error:', err);
    }
  };

  const handleView = async (resumeId) => {
    window.open(`index.html#/resumes/${resumeId}`, '_blank');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Recent Resumes for {company}
        </Typography>

        <Stack spacing={1.5}>
          {resumes.slice(0, 3).map((resume) => (
            <Box
              key={resume.id}
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    {resume.jobTitle}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(resume.generatedAt)}
                    </Typography>
                    <Chip
                      label={resume.status}
                      size="small"
                      color={
                        resume.status === 'completed' ? 'success' :
                        resume.status === 'processing' ? 'warning' : 'default'
                      }
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Stack>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="View Resume">
                    <IconButton
                      size="small"
                      onClick={() => handleView(resume.id)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {resume.status === 'completed' && (
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(resume.id)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>

        {resumes.length > 3 && (
          <Button
            fullWidth
            size="small"
            sx={{ mt: 1.5 }}
            onClick={() => window.open('index.html#/resumes', '_blank')}
          >
            View All ({resumes.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentResumes;
