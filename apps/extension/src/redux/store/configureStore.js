import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers/rootReducer';
import rootSaga from '../sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();

// Redux DevTools setup
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => {
  const store = createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(sagaMiddleware)
      // Add other middleware here if needed
    )
  );

  sagaMiddleware.run(rootSaga);
  
  return store;
};

const store = configureStore();

export default store;
