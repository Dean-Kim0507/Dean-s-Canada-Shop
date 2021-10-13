const express = require('express');
const router = express.Router();
const { auth, cache } = require("../middleware/auth");
const userCon = require('../controllers/users')
//=================================
//             User
//       Api for user model
//=================================

// Autenticate a token and then return user's info if it's valid (Receive: Token / Return user's info)
// Trigger -> authenticate user's jwt on the auth(middleware) ->if it's valid return user's info and refresh token or return err

router.get("/auth", cache(2), userCon.auth);

// Register page
// Get a user's info and then store it (Receive: User's info / Return Success(boolean))
// Validation - mongo DB will return error by using model if it has some wroing validation
// Trigger -> get user's info and then store it to the DB -> reutrn success:true
router.post("/register", userCon.register);

//Login function (Receive: email and plain password/ Return Success(boolean),usreId and cookie(token, exp))
//Trigger -> get email ans password -> comapre with using scheman method -> if it's matched, generate a token -> reutrn Success(boolean),usreId and cookie(token, exp)
router.post("/login", userCon.login);

// logout (Receive: user ID / return success(boolean))
// Trigger -> get user id -> delet token and token expire time in the DB -> return success(boolean)
router.get("/logout", cache(1), userCon.logout);

// add to cart (Receive: product info / Return: User's info with care info)
// Trigger -> autehnticate User and then get user's  info from middleware -> Check if this user's cart alreday has this product -> if there is count +1 or not, add into cart array
router.post("/addToCart", cache(1), userCon.addToCart);

//Remove cart (Receive: Product id (query) /  Return: Product info and user info with a cart )
router.get('/removeFromCart', cache(1), userCon.removeFromCart)

// Success Buy (Receive: payment info with product info / Return: suceess(boolean), user's cart info (empty))
// Trigger -> get payment info with product info -> sotre to the history -> count +1 the number of product's sold and delete all contents in the user'cart-> return empty cart
router.post('/successBuy', cache(1), userCon.successBuy)

// Google login (Receive: access token / Return: User info)
// Trigger -> receive:token -> if new user, store to db and return user info or just return user info -> return userinfo
router.post('/google', userCon.google)

// fogot (Receive: email / Return: success(boolean) and err message) 
// receive: email, user want to find -> search the email and if it exists, return and send email with token (1hour validation)or not, send err with err message
router.post('/forgot', userCon.forgot)

// Check token and then reset password / receive: token and email, send: success:true
router.post('/resetpw', auth, userCon.resetpw)

module.exports = router;
