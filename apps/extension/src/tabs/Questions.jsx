import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { submitQuestion } from "../redux/actions/questionActions";
import { StyledTextarea } from "../components/TextArea";

const Questions = () => {
  const dispatch = useDispatch();
  const { loading, answers, error } = useSelector((state) => state.question);

  const [question, setQuestion] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      dispatch(submitQuestion(question.trim()));
      setQuestion("");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage("Copied to clipboard!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage("Failed to copy");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  return (
    <Box sx={{ p: 2, mx: "auto", width: "100%", maxWidth: 500 }}>
      {/* Ask Question */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Ask a Question</Typography>
        <form onSubmit={handleSubmit}>
          <StyledTextarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            minRows={3}
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              marginBottom: 12,
              fontSize: 14,
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={!question.trim() || loading}
            sx={{ py: 1.25, fontWeight: 600, borderRadius: 2, textTransform: "none" }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Ask"}
          </Button>
        </form>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Answers */}
      {answers.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>Previous Answers</Typography>
          {answers.map((item, idx) => (
            <Card key={idx} variant="outlined" sx={{ mb: 2, borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: 13 }}>
                    Q: {item.question}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(item.answer)}
                    title="Copy"
                    sx={{ "&:hover": { bgcolor: "action.hover" }, borderRadius: 1 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: 14 }}>
                  {item.answer}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Questions;
