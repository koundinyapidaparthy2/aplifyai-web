import { call, put, takeLatest } from 'redux-saga/effects';
import { SUBMIT_JOB, SET_PDF_URL, SET_COVER_LETTER_URL } from '../actionTypes';
import api from '../actions/jobActions';

function* handleSubmitJobRequest(action) {
  try {
    console.log({action})
    const data = yield call(api.submitJob, action.payload);
    yield put({ type: SUBMIT_JOB.SUCCESS, payload: data });
    if (data?.pdfUrl) {
      yield put({ type: SET_PDF_URL, payload: data.pdfUrl });
    }
    if (data?.coverLetterUrl) {
      yield put({ type: SET_COVER_LETTER_URL, payload: data.coverLetterUrl });
    }
  } catch (error) {
    yield put({ type: SUBMIT_JOB.FAILURE, payload: error.message });
  }
}

function* watchJobRequests() {
  yield takeLatest(SUBMIT_JOB.REQUEST, handleSubmitJobRequest);
}

export default watchJobRequests;
