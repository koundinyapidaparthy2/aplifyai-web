import { call, put, takeLatest } from 'redux-saga/effects';
import { FETCH_TIMESTAMP } from '../actionTypes';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://resume-generator-148210206342.us-central1.run.app';
const API_URL = `${API_BASE_URL}/timestamp`;

const fetchTimestampApi = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch timestamp');
  const data = await response.json();
  return data.timestamp; // e.g., "09-08-2025T23:01:23"
};

function* handleFetchTimestamp() {
  try {
    const ts = yield call(fetchTimestampApi);
    yield put({ type: FETCH_TIMESTAMP.SUCCESS, payload: ts });
  } catch (error) {
    yield put({ type: FETCH_TIMESTAMP.FAILURE, payload: error.message });
  }
}

function* watchReloadRequests() {
  yield takeLatest(FETCH_TIMESTAMP.REQUEST, handleFetchTimestamp);
}

export default watchReloadRequests;
