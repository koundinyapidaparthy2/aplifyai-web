import { SUBMIT_JOB, SET_PDF_URL, SET_COVER_LETTER_URL } from '../actionTypes';

const initialState = {
  loading: false,
  submitStatus: null, // 'success', 'failed', or null
  error: null,
  pdfUrl: null,
  coverLetterUrl: null
};

const jobReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBMIT_JOB.REQUEST:
      return {
        ...state,
        loading: true,
        submitStatus: 'pending',
        error: null
      };

    case SUBMIT_JOB.SUCCESS:
      return {
        ...state,
        loading: false,
        submitStatus: 'success',
        error: null
      };

    case SUBMIT_JOB.FAILURE:
      return {
        ...state,
        loading: false,
        submitStatus: 'failed',
        error: action.payload
      };

    case SET_PDF_URL:
      return {
        ...state,
        pdfUrl: action.payload
      };
    case SET_COVER_LETTER_URL:
      return {
        ...state,
        coverLetterUrl: action.payload
      };
    default:
      return state;
  }
};

export default jobReducer;
