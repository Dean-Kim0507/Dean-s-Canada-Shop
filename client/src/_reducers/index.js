import { combineReducers } from "redux";
import user from "./user_reducer";
import prod from "./prod_reducer";

const rootReducer = combineReducers({
  user,
  prod,
});

export default rootReducer;
