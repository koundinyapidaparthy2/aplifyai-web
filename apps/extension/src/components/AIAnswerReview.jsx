import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  AlertTitle,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

/**
 * AIAnswerReview - Review and edit AI-generated answers
 * 
 * Features:
 * - Display all detected questions
 * - Show AI-generated answers with confidence scores
 * - Allow editing before filling
 * - Show cached answer suggestions
 * - Save good answers to cache
 * - Display token usage and generation time
 */
export default function AIAnswerReview({ open, onClose, onFillAnswers }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [cachedSuggestions, setCachedSuggestions] = useState(new Map());
  const [ratings, setRatings] = useState(new Map());

  // Load questions on mount
  useEffect(() => {
    if (open) {
      loadQuestions();
    }
  }, [open]);

  /**
   * Load detected questions from content script
   */
  const loadQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Request questions preview
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'GET_SCREENING_QUESTIONS'
      });

      if (response.success) {
        setQuestions(response.questions);
        
        // Load cached suggestions for each question
        const suggestions = new Map();
        response.questions.forEach(q => {
          if (q.cachedAnswers && q.cachedAnswers.length > 0) {
            suggestions.set(q.id, q.cachedAnswers);
          }
        });
        setCachedSuggestions(suggestions);
      } else {
        setError(response.error || 'Failed to load questions');
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate answers for all questions
   */
  const generateAllAnswers = async () => {
    setGenerating(true);
    setError(null);
    setGenerationProgress({ current: 0, total: questions.length });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Request answer generation
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'GENERATE_ANSWERS',
        options: {
          useCached: true,
          onProgress: (progress) => {
            setGenerationProgress(progress);
          }
        }
      });

      if (response.success) {
        // Store answers
        const answerMap = new Map();
        response.answers.forEach(answer => {
          answerMap.set(answer.questionId, answer);
        });
        setAnswers(answerMap);
        setStatistics(response.statistics);
        
        // Show success message
        if (response.statistics.fromCache > 0) {
          console.log(`Used ${response.statistics.fromCache} cached answers`);
        }
      } else {
        setError(response.error || 'Failed to generate answers');
      }
    } catch (err) {
      console.error('Error generating answers:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
      setGenerationProgress(null);
    }
  };

  /**
   * Regenerate answer for a specific question
   */
  const regenerateAnswer = async (questionId) => {
    setGenerating(true);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'REGENERATE_ANSWER',
        questionId: questionId,
        options: { useCached: false }
      });

      if (response.success) {
        // Update answer
        const newAnswers = new Map(answers);
        newAnswers.set(questionId, response.answer);
        setAnswers(newAnswers);
      } else {
        setError(response.error || 'Failed to regenerate answer');
      }
    } catch (err) {
      console.error('Error regenerating answer:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Update answer text (user edit)
   */
  const updateAnswer = (questionId, newText) => {
    const answer = answers.get(questionId);
    if (!answer) return;

    const updatedAnswer = {
      ...answer,
      answer: newText,
      userEdited: true
    };

    const newAnswers = new Map(answers);
    newAnswers.set(questionId, updatedAnswer);
    setAnswers(newAnswers);
  };

  /**
   * Use a cached answer
   */
  const useCachedAnswer = (questionId, cachedAnswer) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      questionId: questionId,
      answer: cachedAnswer.answer,
      fromCache: true,
      cacheId: cachedAnswer.id,
      similarity: cachedAnswer.similarity,
      questionType: cachedAnswer.questionType
    });
    setAnswers(newAnswers);
  };

  /**
   * Save answer to cache
   */
  const saveToCache = async (questionId) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const rating = ratings.get(questionId) || null;

      await chrome.tabs.sendMessage(tab.id, {
        action: 'SAVE_ANSWER_TO_CACHE',
        questionId: questionId,
        rating: rating
      });

      // Show success feedback
      console.log('Answer saved to cache');
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  /**
   * Fill all answers into form
   */
  const handleFillAnswers = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'FILL_ANSWERS',
        options: {
          skipFilled: false,
          simulateTyping: true,
          delay: 500
        }
      });

      if (response.success) {
        // Close dialog and notify parent
        if (onFillAnswers) {
          onFillAnswers(response);
        }
        onClose();
      } else {
        setError(response.error || 'Failed to fill answers');
      }
    } catch (err) {
      console.error('Error filling answers:', err);
      setError(err.message);
    }
  };

  /**
   * Copy answer to clipboard
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  /**
   * Render question card
   */
  const renderQuestionCard = (question, index) => {
    const answer = answers.get(question.id);
    const isEditing = editingId === question.id;
    const suggestions = cachedSuggestions.get(question.id) || [];
    const rating = ratings.get(question.id) || 0;

    return (
      <Card key={question.id} sx={{ mb: 2 }}>
        <CardContent>
          {/* Question Header */}
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                Question {index + 1}
                {question.isRequired && (
                  <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />
                )}
                <Chip 
                  label={question.type} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ ml: 1 }} 
                />
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {question.text}
              </Typography>
              {question.maxLength && (
                <Typography variant="caption" color="text.secondary">
                  Max length: {question.maxLength} characters
                </Typography>
              )}
            </Box>
          </Box>

          {/* Cached Suggestions */}
          {!answer && suggestions.length > 0 && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center">
                  <HistoryIcon sx={{ mr: 1 }} />
                  <Typography>
                    {suggestions.length} Saved Answer{suggestions.length > 1 ? 's' : ''} Available
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {suggestions.map((cached, idx) => (
                  <Card key={idx} variant="outlined" sx={{ mb: 1 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Chip 
                            label={`${Math.round(cached.similarity * 100)}% Match`} 
                            size="small" 
                            color="success" 
                            sx={{ mb: 1 }} 
                          />
                          {cached.rating && (
                            <Rating value={cached.rating} size="small" readOnly sx={{ ml: 1 }} />
                          )}
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {cached.answer.substring(0, 200)}
                            {cached.answer.length > 200 && '...'}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<ThumbUpIcon />}
                          onClick={() => useCachedAnswer(question.id, cached)}
                        >
                          Use This
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Answer Display/Edit */}
          {answer ? (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  {answer.fromCache ? (
                    <Chip 
                      icon={<HistoryIcon />} 
                      label="From Cache" 
                      size="small" 
                      color="success" 
                    />
                  ) : (
                    <Chip 
                      icon={<AutoAwesomeIcon />} 
                      label="AI Generated" 
                      size="small" 
                      color="secondary" 
                    />
                  )}
                  {answer.userEdited && (
                    <Chip label="Edited" size="small" variant="outlined" />
                  )}
                  {answer.confidence && (
                    <Tooltip title={`Confidence: ${Math.round(answer.confidence * 100)}%`}>
                      <Chip 
                        label={`${Math.round(answer.confidence * 100)}%`} 
                        size="small" 
                      />
                    </Tooltip>
                  )}
                </Box>
                <Box>
                  <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => copyToClipboard(answer.answer)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => setEditingId(isEditing ? null : question.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Regenerate">
                    <IconButton 
                      size="small" 
                      onClick={() => regenerateAnswer(question.id)}
                      disabled={generating}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={answer.answer}
                  onChange={(e) => updateAnswer(question.id, e.target.value)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {answer.answer}
                  </Typography>
                </Box>
              )}

              {/* Answer Metadata */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {answer.answer.length} characters
                  {question.maxLength && ` / ${question.maxLength} max`}
                  {answer.tokenCount && ` • ~${answer.tokenCount} tokens`}
                </Typography>
                
                {!answer.fromCache && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption">Rate:</Typography>
                    <Rating
                      size="small"
                      value={rating}
                      onChange={(e, newValue) => {
                        const newRatings = new Map(ratings);
                        newRatings.set(question.id, newValue);
                        setRatings(newRatings);
                      }}
                    />
                    <Tooltip title="Save to cache for future use">
                      <IconButton 
                        size="small" 
                        onClick={() => saveToCache(question.id)}
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {/* Length warning */}
              {question.maxLength && answer.answer.length > question.maxLength && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Answer exceeds maximum length by {answer.answer.length - question.maxLength} characters
                </Alert>
              )}
            </Box>
          ) : (
            <Alert severity="info" icon={<WarningIcon />}>
              No answer generated yet. Click "Generate All Answers" to create AI responses.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * Render statistics panel
   */
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Generation Statistics
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Questions: <strong>{statistics.totalQuestions}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Answers Generated: <strong>{statistics.generated}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              From Cache: <strong>{statistics.fromCache}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              User Edited: <strong>{statistics.userEdited}</strong>
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Tokens: <strong>~{statistics.totalTokens}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Confidence: <strong>{Math.round(statistics.averageConfidence * 100)}%</strong>
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" gutterBottom>
              By Question Type:
            </Typography>
            {Object.entries(statistics.byType).map(([type, count]) => (
              <Chip 
                key={type} 
                label={`${type}: ${count}`} 
                size="small" 
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
            ))}
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <AutoAwesomeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              AI Answer Review
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        ) : (
          <>
            {/* Generation Progress */}
            {generating && generationProgress && (
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    Generating answers... ({generationProgress.current}/{generationProgress.total})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {generationProgress.question}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(generationProgress.current / generationProgress.total) * 100} 
                />
              </Box>
            )}

            {/* Summary */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Found {questions.length} Screening Question{questions.length !== 1 ? 's' : ''}</AlertTitle>
              {questions.filter(q => q.hasCachedAnswers).length > 0 && (
                <Typography variant="body2">
                  {questions.filter(q => q.hasCachedAnswers).length} question(s) have cached answers available.
                </Typography>
              )}
            </Alert>

            {/* Tabs */}
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
              <Tab label="Questions & Answers" />
              <Tab label="Statistics" disabled={!statistics} />
            </Tabs>

            {/* Content */}
            {currentTab === 0 && (
              <Box>
                {questions.map((question, index) => renderQuestionCard(question, index))}
                
                {questions.length === 0 && (
                  <Alert severity="info">
                    No screening questions detected on this page.
                  </Alert>
                )}
              </Box>
            )}

            {currentTab === 1 && renderStatistics()}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={loadQuestions}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          onClick={generateAllAnswers}
          startIcon={<AutoAwesomeIcon />}
          disabled={generating || questions.length === 0}
          variant="outlined"
        >
          Generate All Answers
        </Button>
        <Button
          onClick={handleFillAnswers}
          startIcon={<CheckCircleIcon />}
          variant="contained"
          disabled={answers.size === 0}
        >
          Fill {answers.size} Answer{answers.size !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
