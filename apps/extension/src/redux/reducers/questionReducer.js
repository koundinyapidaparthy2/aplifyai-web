import { SUBMIT_QUESTION } from '../actionTypes';

const initialState = {
  loading: false,
  answers: [],
  error: null
};

const questionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBMIT_QUESTION.REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case SUBMIT_QUESTION.SUCCESS:
      return {
        ...state,
        loading: false,
        answers: [
          {
            question: action.payload.question,
            answer: action.payload.answer,
            timestamp: new Date().toISOString()
          },
          ...state.answers
        ],
        error: null
      };

    case SUBMIT_QUESTION.FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default questionReducer;
