import { FETCH_TIMESTAMP } from '../actionTypes';

// Backward-compatible alias: dispatches the new grouped REQUEST
export const reloadRequest = () => ({
  type: FETCH_TIMESTAMP.REQUEST
});

// Direct action creators for SUCCESS/FAILURE if needed elsewhere
export const reloadSuccess = (timestamp) => ({
  type: FETCH_TIMESTAMP.SUCCESS,
  payload: timestamp
});

export const reloadFailure = (error) => ({
  type: FETCH_TIMESTAMP.FAILURE,
  payload: error
});

