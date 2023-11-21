import {AuthAction, AuthState} from '../@types/auth';
import AuthActionTypes from './authActionTypes';

const initialState: AuthState = {
  user: null,
};

const authReducer = (state: AuthState = initialState, action: AuthAction): AuthState => {
  if (!state) {
    return initialState;
  }
  switch (action.type) {
    case AuthActionTypes.SAVE:
      return { user: action.user };
    case AuthActionTypes.REMOVE:
      return { user: null };
  }
  return state;
};
export default authReducer;
