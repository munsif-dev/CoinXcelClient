import { thunk } from "redux-thunk";
import authReducer from "./auth/reducer";

import { combineReducers, legacy_createStore, applyMiddleware } from "redux";

const rootReducer = combineReducers({
  auth: authReducer,
  // Combine all reducers
});

export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));
