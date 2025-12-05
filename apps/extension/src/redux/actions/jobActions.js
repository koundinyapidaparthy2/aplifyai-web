import { FETCH_TIMESTAMP, SUBMIT_JOB, SET_PDF_URL, SET_COVER_LETTER_URL } from '../actionTypes';

// Get API base URL from environment variable
// Vite exposes env vars prefixed with VITE_ via import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://resume-generator-148210206342.us-central1.run.app';

// Log API configuration in development mode
if (import.meta.env.DEV) {
  console.log('🔌 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.VITE_APP_ENV || 'development');
}

// Action Creators
export const fetchTimestamp = () => ({
  type: FETCH_TIMESTAMP.REQUEST
});

export const submitJob = (jobData) => ({
  type: SUBMIT_JOB.REQUEST,
  payload: jobData
});

export const setPdfUrl = (url) => ({
  type: SET_PDF_URL,
  payload: url
});

export const deletePdfUrl = () => ({
  type: SET_PDF_URL,
  payload: null
});

export const setCoverLetterUrl = (url) => ({
  type: SET_COVER_LETTER_URL,
  payload: url
});

export const deleteCoverLetterUrl = () => ({
  type: SET_COVER_LETTER_URL,
  payload: null
});

// API Service
const api = {
  fetchTimestamp: async () => {
    const response = await fetch(`${API_BASE_URL}/timestamp`);
    if (!response.ok) throw new Error('Failed to fetch timestamp');
    const data = await response.json();
    return data.timestamp;
  },
  
  submitJob: async (jobData) => {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: jobData.companyName,
        jobTitle: jobData.jobTitle,
        jobDescription: jobData.jobDescription,
        missingSkills: jobData.missingKeys
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to generate resume');
    }
    
    return response.json();
  }
};

export default api;
