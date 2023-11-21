import {BlockUIAction, BlockUIState} from '../@types/blockUI';
import BlockUIActionTypes from './blockUIActionTypes';

const initialState: BlockUIState = {
  blocked: false,
};

const blockUIReducer = (
  state: BlockUIState = initialState,
  action: BlockUIAction,
): BlockUIState => {
  if (!state) {
    return { blocked: false };
  }
  switch (action.type) {
    case BlockUIActionTypes.START:
      return { blocked: true };
    case BlockUIActionTypes.STOP:
      return { blocked: false };
  }
  return state;
};
export default blockUIReducer;
