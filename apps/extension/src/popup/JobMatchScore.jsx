import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const JobMatchScore = ({ matchScore }) => {
  const [expanded, setExpanded] = useState(false);

  if (!matchScore) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircleIcon color="success" fontSize="small" />;
    if (score >= 60) return <CheckCircleIcon color="warning" fontSize="small" />;
    return <CancelIcon color="error" fontSize="small" />;
  };

  const ScoreBar = ({ label, score, icon }) => (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="caption" fontWeight={500}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="caption" fontWeight={600} color={`${getScoreColor(score)}.main`}>
          {Math.round(score)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        color={getScoreColor(score)}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={600}>
            Match Analysis
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.3s',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ mt: 2 }}>
            <ScoreBar
              label="Skills Match"
              score={matchScore.skills}
              icon={<CodeIcon fontSize="small" color="action" />}
            />
            <ScoreBar
              label="Experience"
              score={matchScore.experience}
              icon={<WorkIcon fontSize="small" color="action" />}
            />
            <ScoreBar
              label="Education"
              score={matchScore.education}
              icon={<SchoolIcon fontSize="small" color="action" />}
            />
            <ScoreBar
              label="Location"
              score={matchScore.location}
              icon={<LocationIcon fontSize="small" color="action" />}
            />

            {matchScore.matchingSkills?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 1 }}>
                  Matching Skills ({matchScore.matchingSkills.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {matchScore.matchingSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<CheckCircleIcon />}
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </>
            )}

            {matchScore.missingSkills?.length > 0 && (
              <>
                <Typography variant="caption" fontWeight={600} display="block" sx={{ mt: 2, mb: 1 }}>
                  Skills to Highlight ({matchScore.missingSkills.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {matchScore.missingSkills.slice(0, 5).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
                {matchScore.missingSkills.length > 5 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    +{matchScore.missingSkills.length - 5} more
                  </Typography>
                )}
              </>
            )}

            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="caption" color="info.dark">
                💡 <strong>Tip:</strong> {getMatchTip(matchScore.overall)}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

/**
 * Get personalized tip based on match score
 */
const getMatchTip = (score) => {
  if (score >= 80) {
    return "You're a great match! Highlight your matching skills prominently in your resume.";
  } else if (score >= 60) {
    return "Good match! Focus on transferable skills and relevant experience in your resume.";
  } else {
    return "Emphasize your willingness to learn and any related experience you have.";
  }
};

export default JobMatchScore;
