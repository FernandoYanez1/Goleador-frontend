import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import BlockUIActionTypes from '../redux/blockui/blockUIActionTypes';
import {BlockUIAction} from '../redux/@types/blockUI';
import {AppStore} from '../redux/reducer';
import {ReduxInterface} from './reduxInterface';

export default class BlockUIService implements ReduxInterface {
  private static START: BlockUIAction = { type: BlockUIActionTypes.START, blocked: true };

  private static STOP: BlockUIAction = { type: BlockUIActionTypes.STOP, blocked: false };

  public dispatch: any;

  constructor() {
    this.dispatch = useDispatch();
  }

  public start() {
    this.dispatch(BlockUIService.START);
  }

  public stop() {
    this.dispatch(BlockUIService.STOP);
  }

  public getCurrentState() {
    return useSelector((state: AppStore) => state.blockUI, shallowEqual);
  }
}
