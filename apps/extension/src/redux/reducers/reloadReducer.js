import { FETCH_TIMESTAMP } from '../actionTypes';

const initialState = {
  loading: false,
  lastUpdated: null,
  error: null
};

const reloadReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TIMESTAMP.REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_TIMESTAMP.SUCCESS:
      return {
        ...state,
        loading: false,
        lastUpdated: action.payload,
        error: null
      };

    case FETCH_TIMESTAMP.FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default reloadReducer;
