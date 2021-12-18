import {
  GET_PROD_DETAIL,
  GET_PRODS_SET_VIEWS,
  GET_PROD_FEEDBACKS,
  UPLOAD_PRODUCT,
} from "../_actions/types";

export default function (state = {}, action) {
  switch (action.type) {
    case GET_PROD_DETAIL:
      return { ...state, prodDetail: action.payload };
    case GET_PRODS_SET_VIEWS:
      return { ...state, products: action.payload };
    case GET_PROD_FEEDBACKS:
      return { ...state, feedbacks: action.payload };
    case UPLOAD_PRODUCT:
      return { ...state, uploadProduct: action.payload };
    default:
      return state;
  }
}
