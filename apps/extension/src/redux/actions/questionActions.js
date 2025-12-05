import { SUBMIT_QUESTION } from '../actionTypes';

export const submitQuestionRequest = (question) => ({
  type: SUBMIT_QUESTION.REQUEST,
  payload: question
});

export const submitQuestionSuccess = (question, answer) => ({
  type: SUBMIT_QUESTION.SUCCESS,
  payload: { question, answer }
});

export const submitQuestionFailure = (error) => ({
  type: SUBMIT_QUESTION.FAILURE,
  payload: error
});

export const submitQuestion = (question) => ({
  type: SUBMIT_QUESTION.REQUEST,
  payload: question
});
