import { thunk, ThunkAction, ThunkDispatch } from "redux-thunk";
import authReducer from "./auth/reducer";

import {
  combineReducers,
  legacy_createStore,
  applyMiddleware,
  Action,
} from "redux";

const rootReducer = combineReducers({
  auth: authReducer,
  // Combine all reducers
});

export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ThunkDispatch<RootState, void, Action>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;
