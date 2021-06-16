import axios from 'axios';
import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER,
    ADD_TO_CART,
    GET_CART_ITEMS,
    REMOVE_CART_ITEM,
    ON_SUCCESS_BUY
} from './types';
import { USER_SERVER } from '../components/Config.js';

// Signup Function (Send: user info / Receive: success(boolean))
export function registerUser(dataToSubmit) {
    const request = axios.post(`${USER_SERVER}/register`, dataToSubmit)
        .then(response => response.data);

    return {
        type: REGISTER_USER,
        payload: request
    }
}

// Signup Function (Send: email, plain password / Receive: Success(boolean),usreId and cookie(token, exp)))
export function loginUser(dataToSubmit) {
    const request = axios.post(`${USER_SERVER}/login`, dataToSubmit)
        .then(response => response.data);

    return {
        type: LOGIN_USER,
        payload: request
    }
}

//High ordered component check user's authentication
//Send: Token / Receive: user's info)
export function auth() {
    const request = axios.get(`${USER_SERVER}/auth`)
        .then(response => response.data);

    return {
        type: AUTH_USER,
        payload: request
    }
}

//logout function (Send: user ID / Receive: success(boolean))
export function logoutUser() {
    const request = axios.get(`${USER_SERVER}/logout`)
        .then(response => response.data);

    return {
        type: LOGOUT_USER,
        payload: request
    }
}


// add to cart (Send: product info / Receive: User's info with care info)
export function addToCart(id) {
    let body = {
        productId: id
    }
    const request = axios.post(`${USER_SERVER}/addToCart`, body)
        .then(response => response.data);

    return {
        type: ADD_TO_CART,
        payload: request
    }
}

//Get a card info frm server and then count quantity
export function getCartItems(cartItems, userCart) {

    const request = axios.get(`/api/product/products_by_id?id=${cartItems}&type=array`)
        .then(response => {
            // Get CartItem from Product Collection put in quantity
            console.log(response.data)
            userCart.forEach(cartItem => {
                response.data.forEach((productDetail, index) => {
                    if (cartItem.id === productDetail._id) {
                        response.data[index].quantity = cartItem.quantity
                        // If product.id is the same as user's data.id, put user's data.quantity into response.data
                    }
                })
            })

            return response.data;
        });
    return {
        type: GET_CART_ITEMS,
        payload: request
    }
}

//  Remove cart (Send: Product id (query) /  Receive: Product info and user info with a cart )
export function removeCartItem(productId) {

    const request = axios.get(`/api/users/removeFromCart?id=${productId}`)
        .then(response => {
            //make cart detail by combining product info and quantity 
            response.data.cart.forEach(item => {
                response.data.productInfo.forEach((product, index) => {
                    if (item.id === product._id) {
                        response.data.productInfo[index].quantity = item.quantity
                    }
                })
            })
            return response.data;
        });

    return {
        type: REMOVE_CART_ITEM,
        payload: request
    }
}

// Success Buy (Send: payment info with product info / Receive: suceess(boolean), user's cart info (empty))

export function onSuccessBuy(data) {

    const request = axios.post(`/api/users/successBuy`, data)
        .then(response => response.data);

    return {
        type: ON_SUCCESS_BUY,
        payload: request
    }
}

// Google login (Send: access token id / Receive: User info)
export function googleOAuth(googleData) {

    const request = axios.post(`/api/users/google`, { token: googleData.tokenId })
        .then(response => response.data)
    return {
        type: LOGOUT_USER,
        payload: request
    }
}

// export function forgot(dataToSubmit) {
//     const request = axios.post(`${USER_SERVER}/forgot`, dataToSubmit)
//         .then(response => response.data);

//     return request;
//     // console.log(dataToSubmit)
// }











