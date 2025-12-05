import React, { useState, useEffect , useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';

import { submitJob, deletePdfUrl, fetchTimestamp, deleteCoverLetterUrl } from '../redux/actions/jobActions';
import { StyledTextarea } from '../components/TextArea';

const FIXED_FILENAME = 'Koundinya_Pidaparthy_Software_Engineer.pdf';
const FIXED_COVER_FILENAME = 'Koundinya_Pidaparthy_Cover_Letter.pdf';

const Home = () => {
  const dispatch = useDispatch();
  const { lastUpdated, loading: reloadLoading } = useSelector((state) => state.reload);
  const { loading: submitLoading, error: submitError, pdfUrl, coverLetterUrl } = useSelector((state) => state.job);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    missingKeys: ''
  });
  const dragRef = useRef(null);
  const dragCoverRef = useRef(null);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadCover = async () => {
    if (!coverToShow) {
      console.error('No Cover Letter URL available to download.');
      return;
    }

    try {
      chrome.downloads.download(
        {
          url: coverToShow,
          filename: FIXED_COVER_FILENAME,
          conflictAction: 'overwrite',
          saveAs: false
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('Download failed:', chrome.runtime.lastError);
          } else {
            console.log('Download started, ID:', downloadId);
          }
        }
      );
    } catch (err) {
      console.error('Error downloading Cover Letter PDF:', err);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchTimestamp());
  };

  // Initial load
  useEffect(() => {
    dispatch(fetchTimestamp());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(submitJob({
        ...formData,
        missingKeys: formData.missingKeys
      }));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting job:', error);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const pdfToShow = pdfUrl
  const coverToShow = coverLetterUrl
  
  const handleDeletePdf = () => {
    dispatch(deletePdfUrl());
  };

  const handleDeleteCover = () => {
    dispatch(deleteCoverLetterUrl());
  };

  const handleDragStart = async (e) => {
    try {
      const response = await fetch(pdfToShow);
      const blob = await response.blob();
      const file = new File([blob], FIXED_FILENAME, { type: "application/pdf" });

      const dataTransfer = e.dataTransfer;
      dataTransfer.effectAllowed = "copy";

      if (dataTransfer.items) {
        dataTransfer.items.add(file);
      }
      // "DownloadURL" lets websites like Gmail treat it as a dropped file
      dataTransfer.setData(
        "DownloadURL",
        `application/pdf:${file.name}:${URL.createObjectURL(blob)}`
      );
      console.log(dataTransfer);
    } catch (err) {
      console.error("Error preparing PDF for drag:", err);
    }
  };

  const handleDragStartCover = async (e) => {
    try {
      const response = await fetch(coverToShow);
      const blob = await response.blob();
      const file = new File([blob], FIXED_COVER_FILENAME, { type: 'application/pdf' });

      const dataTransfer = e.dataTransfer;
      dataTransfer.effectAllowed = 'copy';

      if (dataTransfer.items) {
        dataTransfer.items.add(file);
      }
      dataTransfer.setData(
        'DownloadURL',
        `application/pdf:${file.name}:${URL.createObjectURL(blob)}`
      );
    } catch (err) {
      console.error('Error preparing Cover Letter PDF for drag:', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfToShow) {
      console.error("No PDF URL available to download.");
      return;
    }
  
    try {
      // Chrome downloads API
      chrome.downloads.download(
        {
          url: pdfToShow,        // signed URL
          filename: FIXED_FILENAME, // fixed filename
          conflictAction: "overwrite", // always replace existing file
          saveAs: false           // don't show Save As dialog
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("Download failed:", chrome.runtime.lastError);
          } else {
            console.log("Download started, ID:", downloadId);
          }
        }
      );
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };
  
  

  return (
    <Box sx={{ p: 1, mx: "auto", width: "100%", maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={2} sx={{ p: 1, width: '100%', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2">
          Last Refresh: {lastUpdated || 'N/A'}
        </Typography>
        {reloadLoading ? <CircularProgress size={14} /> : <RefreshIcon color="primary" onClick={handleRefresh} style={{ cursor: 'pointer' }} />}
      </Paper>

      {!pdfUrl ? (
        /* Job Form - Only show when there's no PDF URL */
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 2, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Company Name" name="companyName"
              value={formData.companyName} onChange={handleChange}
              required margin="dense"
            />
            <TextField
              fullWidth label="Job Title" name="jobTitle"
              value={formData.jobTitle} onChange={handleChange}
              required margin="dense"
            />
            <StyledTextarea
              placeholder="Job Description *" name="jobDescription"
              value={formData.jobDescription} onChange={handleChange}
              required minRows={2} style={{ width: '100%', marginTop: 8 }}
            />
            <TextField
              fullWidth label="Missing Keys" name="missingKeys"
              value={formData.missingKeys} onChange={handleChange}
              helperText="Separate keys with commas" margin="dense"
            />
            <Button
              type="submit" variant="contained" fullWidth
              disabled={submitLoading} sx={{ mt: 2 }}
            >
              {submitLoading ? <CircularProgress size={24} color="inherit" /> : '🚀 Submit Job'}
            </Button>
          </form>
        </Paper>
      ) : (
        /* PDF Info - Only show when there's a PDF URL */
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <PictureAsPdfIcon color="error" />
            </Grid>
            <Grid item xs={6} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Tooltip title={FIXED_FILENAME}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                  {FIXED_FILENAME}
                </Typography>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Open in new tab">
                <IconButton size="small" onClick={() => window.open(pdfToShow, '_blank')} color="inherit">
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Download PDF">
                <IconButton 
                  size="small" 
                  onClick={handleDownloadPdf} 
                  color="inherit"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Delete PDF">
                <IconButton 
                  size="small" 
                  onClick={handleDeletePdf}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>
      )}
      {/* Cover Letter Info - Only show when there's a Cover Letter URL */}
      {coverLetterUrl && (
        <Paper elevation={2} sx={{ mt: 2, p: 2, borderRadius: 2, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <PictureAsPdfIcon color="error" />
            </Grid>
            <Grid item xs={6} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Tooltip title={FIXED_COVER_FILENAME}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                  {FIXED_COVER_FILENAME}
                </Typography>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Open in new tab">
                <IconButton size="small" onClick={() => window.open(coverToShow, '_blank')} color="inherit">
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Download PDF">
                <IconButton 
                  size="small" 
                  onClick={handleDownloadCover} 
                  color="inherit"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Delete PDF">
                <IconButton 
                  size="small" 
                  onClick={handleDeleteCover}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          {/* Drag-out area for Cover Letter */}
          <Box
            ref={dragCoverRef}
            draggable
            onDragStart={handleDragStartCover}
            sx={{
              mt: 2,
              p: 2,
              border: '2px dashed #aaa',
              borderRadius: 2,
              textAlign: 'center',
              fontSize: 13,
              color: '#555',
              backgroundColor: '#fafafa',
              cursor: 'grab',
              width: '100%'
            }}
          >
            📄 Drag this Cover Letter PDF into another website
          </Box>
        </Paper>
      )}
          

      {/* Error Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={submitError ? 'error' : 'success'}
        >
          {submitError || 'Resume generated successfully!'}
        </Alert>
      </Snackbar>
        {/* 🔹 Drag-out area */}
        <Box
            ref={dragRef}
            draggable
            onDragStart={handleDragStart}
            sx={{
              mt: 2,
              p: 2,
              border: "2px dashed #aaa",
              borderRadius: 2,
              textAlign: "center",
              fontSize: 13,
              color: "#555",
              backgroundColor: "#fafafa",
              cursor: "grab",
              width: "100%"
            }}
          >
            📄 Drag this PDF into another website
        </Box>
    </Box>
  );
};

export default Home;
