import { combineReducers } from 'redux';
import reloadReducer from './reloadReducer';
import jobReducer from './jobReducer';
import questionReducer from './questionReducer';

// Combine all reducers
const rootReducer = combineReducers({
  reload: reloadReducer,
  job: jobReducer,
  question: questionReducer
});

export default rootReducer;
