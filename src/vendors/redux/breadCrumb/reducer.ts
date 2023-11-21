import BreadCrumbActionTypes from './breadCrumbActionTypes';
import {BreadCrumbAction, BreadCrumbItem, BreadCrumbState} from '../@types/breadCrumb';

export const homeItem: BreadCrumbItem = {
  icon: 'pi pi-home',
  url: '/home',
  id: 'home',
  label: 'Página inicial',
};

const initialState: BreadCrumbState = {
  items: [homeItem],
};

const breadCrumbReducer = (
  state: BreadCrumbState = initialState,
  action: BreadCrumbAction,
): BreadCrumbState => {
  if (!state) {
    return initialState;
  }
  switch (action.type) {
    case BreadCrumbActionTypes.CHANGE:
      return { items: action.items };
    case BreadCrumbActionTypes.ADD:
      return { items: [...state.items, action.item] };
    case BreadCrumbActionTypes.REMOVE:
      const temp = state.items.filter((f) => f.id !== action.id);
      return { items: [...temp] };
  }
  return state;
};
export default breadCrumbReducer;
