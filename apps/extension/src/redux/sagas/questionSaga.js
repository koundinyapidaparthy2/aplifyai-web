import { call, put, takeLatest } from 'redux-saga/effects';
import { SUBMIT_QUESTION } from '../actionTypes';
import { 
  submitQuestionSuccess, 
  submitQuestionFailure 
} from '../actions/questionActions';

// Mock API call - replace with actual API call
const submitQuestionToAPI = async (question) => {
  // TODO: Replace with actual API endpoint
  const response = await fetch('/api/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error('Failed to get answer');
  }

  const data = await response.json();
  return data.answer || 'No answer provided';
};

function* handleSubmitQuestion(action) {
  try {
    const answer = yield call(submitQuestionToAPI, action.payload);
    yield put(submitQuestionSuccess(action.payload, answer));
  } catch (error) {
    yield put(submitQuestionFailure(error.message));
  }
}

export function* watchQuestionRequests() {
  yield takeLatest(SUBMIT_QUESTION.REQUEST, handleSubmitQuestion);
}
