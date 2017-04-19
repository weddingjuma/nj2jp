import { createReducer, createActions } from 'reduxsauce';
import localForage from 'localforage';
import Immutable from 'seamless-immutable';

const authLocalForage = localForage.config({
  name: 'NJ2JP-auth',
  storeName: 'nj2jp-auth',
  description: 'Contains persisted values for authorization branch of redux store.',
});
console.warn('authLocalForage: ', authLocalForage);
const { Types, Creators } = createActions({
  authorizationInProgress: null,
  authSocialLogin: ['socialType'],
  loginSuccess: null,
  loginFailure: ['error'],
  loggedOut: null,
});
export const authTypes = Types;
export default Creators;
export const INITIAL_STATE = Immutable({
  authorizationInProgress: false,
  loginSuccess: JSON.parse(localStorage.getItem('loginSuccess')) || null,
  loginError: false,
  loggedIn: JSON.parse(localStorage.getItem('loggedIn')) || false,
});
const authorizationInProgress = state => ({
  ...state,
  authorizationInProgress: true,
});

const loginSuccess = (state) => {
  localStorage.setItem('loggedIn', true);
  localStorage.setItem('loginSuccess', true);
  return ({
    ...state,
    loggedIn: true,
    loginSuccess: true,
  });
};
const loginFailure = (state, { error }) => ({
  loggedIn: false,
  loginSuccess: false,
  loginError: error,
});
const loggedOut = state => ({
  ...state,
  loggedIn: false,
  loginSuccess: null,
});
export const authReducer = createReducer(INITIAL_STATE, {
  [Types.LOGIN_SUCCESS]: loginSuccess,
  [Types.LOGIN_FAILURE]: loginFailure,
  [Types.LOGGED_OUT]: loggedOut,
  [Types.AUTHORIZATION_IN_PROGRESS]: authorizationInProgress,
});
