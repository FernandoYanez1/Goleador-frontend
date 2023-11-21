import {combineReducers} from 'redux';
import blockUIReducer from './blockui/reducer';
import {BlockUIState} from './@types/blockUI';
import {BreadCrumbState} from './@types/breadCrumb';
import breadCrumbReducer from './breadCrumb/reducer';
import {AuthState} from './@types/auth';
import authReducer from './auth/reducer';

export interface AppStore {
  blockUI: BlockUIState;
  breadCrumb: BreadCrumbState;
  auth: AuthState;
}

export default combineReducers({
  blockUI: blockUIReducer,
  breadCrumb: breadCrumbReducer,
  auth: authReducer,
});
