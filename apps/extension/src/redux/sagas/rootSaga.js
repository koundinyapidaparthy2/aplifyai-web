import { all } from 'redux-saga/effects';
import watchReloadRequests from './reloadSaga';
import watchJobRequests from './jobSaga';
import { watchQuestionRequests } from './questionSaga';

// Root Saga
export default function* rootSaga() {
  yield all([
    watchReloadRequests(),
    watchJobRequests(),
    watchQuestionRequests()
  ]);
}
