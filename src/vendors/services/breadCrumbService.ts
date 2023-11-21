import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {BreadCrumbItem} from '../redux/@types/breadCrumb';
import BreadCrumbActionTypes from '../redux/breadCrumb/breadCrumbActionTypes';
import {ReduxInterface} from './reduxInterface';
import {AppStore} from '../redux/reducer';
import {homeItem} from '../redux/breadCrumb/reducer';

export default class BreadCrumbService implements ReduxInterface {
  public dispatch: any;

  constructor() {
    this.dispatch = useDispatch();
  }

  public change(items: BreadCrumbItem[]) {
    this.dispatch({ type: BreadCrumbActionTypes.CHANGE, items: [homeItem, ...items] });
  }

  public add(item: BreadCrumbItem) {
    this.dispatch({ type: BreadCrumbActionTypes.ADD, item: item });
  }

  public remove(id: string) {
    this.dispatch({ type: BreadCrumbActionTypes.REMOVE, id: id });
  }

  getCurrentState(): any {
    return useSelector((state: AppStore) => state.breadCrumb, shallowEqual);
  }
}
