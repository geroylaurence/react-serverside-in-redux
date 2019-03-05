import { routerReducer } from 'react-router-redux';

import appReducer from './app';

/* Helpers */

function stateForKey(state, key) {
  if (state) {
    return state[key];
  }

  return undefined;
}

const rootReducer = (state, action) => {
  // Reducers return their initial state when the state
  // passed to them is undefined. So on signout, we want
  // to trigger this.
  // let s = state;
  // s = undefined;

  return {
    // We don't modify the state passed to the app reducer
    // because we don't want to reset it on signout.
    app: appReducer(stateForKey(state, 'app'), action),
  }
}

export default rootReducer;
