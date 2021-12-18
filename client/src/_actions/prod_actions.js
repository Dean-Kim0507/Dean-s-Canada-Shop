import axios from "axios";
import {
  GET_PROD_DETAIL,
  GET_PRODS_SET_VIEWS,
  GET_PROD_FEEDBACKS,
} from "./types";
import { PROD_SERVER } from "../components/Config.js";

export function getProductDetail(dataToSubmit) {
  const request = axios
    .get(
      `${PROD_SERVER}/products_by_id?id=${dataToSubmit.productId}&type=single&userid=${dataToSubmit._id}`
    )
    .then((response) => {
      return response.data;
    })
    .catch((err) => console.log(err));
  return {
    type: GET_PROD_DETAIL,
    payload: request,
  };
}

export function getProductsSetRecentViews(dataToSubmit) {
  const request = axios
    .post(`${PROD_SERVER}/products`, dataToSubmit)
    .then((response) => {
      return response.data;
    })
    .catch((err) => console.log(err));
  return {
    type: GET_PRODS_SET_VIEWS,
    payload: request,
  };
}

export function getProdInfoAndFeedbacks(dataToSubmit) {
  const request = axios
    .get(
      `${PROD_SERVER}/products_by_id?id=${
        dataToSubmit.productId
      }&type=feedback&userid=${null}`
    )
    .then((response) => {
      return response.data;
    })
    .catch((err) => console.log(err));
  return {
    type: GET_PROD_FEEDBACKS,
    payload: request,
  };
}

export function uploadProduct(dataToSubmit) {
  const request = axios
    .post("/api/product", dataToSubmit)
    .then((response) => {
      return response.data;
    })
    .catch((err) => console.log(err));
  return {
    type: UPLOAD_PRODUCT,
    payload: request,
  };
}
