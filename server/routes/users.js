const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { Payment } = require("../models/Payment");
const { auth } = require("../middleware/auth");
const { OAuth2Client } = require('google-auth-library')
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { google } = require('googleapis')
const moment = require("moment");

const async = require('async');
//=================================
//             User
//       Api for user model
//=================================

// Autenticate a token and then return user's info if it's valid (Receive: Token / Return user's info)
// Trigger -> authenticate user's jwt on the auth(middleware) ->if it's valid return user's info and refresh token or return err
router.get("/auth", auth, (req, res) => {
    //Token Refresh
    req.user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res
            .cookie("w_auth", user.token)
            .status(200)
            .json({
                _id: req.user._id,
                isAdmin: req.user.role === 1 ? false : true,
                isAuth: true,
                email: req.user.email,
                name: req.user.name,
                lastname: req.user.lastname,
                role: req.user.role,
                image: req.user.image,
                cart: req.user.cart,
                history: req.user.history,
            });
    });
});

// Register page
// Get a user's info and then store it (Receive: User's info / Return Success(boolean))
// Validation - mongo DB will return error by using model if it has some wroing validation
// Trigger -> get user's info and then store it to the DB -> reutrn success:true
router.post("/register", (req, res) => {
    const user = new User(req.body);
    user.save((err, doc) => {
        console.log(err)
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

//Login function (Receive: email and plain password/ Return Success(boolean),usreId and cookie(token, exp))
//Trigger -> get email ans password -> comapre with using scheman method -> if it's matched, generate a token -> reutrn Success(boolean),usreId and cookie(token, exp)
router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    });
            });
        });
    });
});

// logout (Receive: user ID / return success(boolean))
// Trigger -> get user id -> delet token and token expire time in the DB -> return success(boolean)
router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

// add to cart (Receive: product info / Return: User's info with care info)
// Trigger -> autehnticate User and then get user's  info from middleware -> Check if this user's cart alreday has this product -> if there is count +1 or not, add into cart array
router.post("/addToCart", auth, (req, res) => {

    //Get User's info
    User.findOne({ _id: req.user._id },
        (err, userInfo) => {

            // To check whether this product is alreday in the DB or not
            // To avoid error for method findOneAndUpdate
            let duplicate = false;
            userInfo.cart.forEach((item) => {
                if (item.id === req.body.productId) {
                    duplicate = true;
                }
            })

            //If the product is alreday in the DB
            if (duplicate) {
                User.findOneAndUpdate(
                    { _id: req.user._id, "cart.id": req.body.productId },
                    // Get User through user._id and then get card.id <- it should be in"" from User 
                    { $inc: { "cart.$.quantity": 1 } }, // update
                    { new: true }, // To get updated user, if it's not, give false
                    (err, userInfo) => {
                        if (err) return res.status(200).json({ success: false, err })
                        res.status(200).send(userInfo.cart)
                    }
                )
            }
            //if there is not product,
            else {
                User.findOneAndUpdate(
                    { _id: req.user._id },
                    {
                        $push: {
                            cart: {
                                id: req.body.productId,
                                quantity: 1,
                                date: Date.now()
                            }
                        }
                    },
                    { new: true },
                    (err, userInfo) => {
                        if (err) return res.status(400).json({ success: false, err })
                        res.status(200).send(userInfo.cart)
                    }
                )
            }
        })
});

//Remove cart (Receive: Product id (query) /  Return: Product info and user info with a cart )
router.get('/removeFromCart', auth, (req, res) => {

    //Delete cart info in a user first
    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            "$pull":
                { "cart": { "id": req.query.id } }
        },
        { new: true },
        (err, userInfo) => {
            let cart = userInfo.cart;

            //productIds => ['5e8961794be6d81ce2b94752', '5e8960d721e2ca1cb3e30de4'] 
            let array = cart.map(item => {
                return item.id
            })

            //Get and send a product info with user's cart
            Product.find({ _id: { $in: array } })
                .populate('writer')
                .exec((err, productInfo) => {
                    return res.status(200).json({
                        productInfo,
                        cart
                    })
                })
        }
    )
})

// Success Buy (Receive: payment info with product info / Return: suceess(boolean), user's cart info (empty))
// Trigger -> get payment info with product info -> sotre to the history -> count +1 the number of product's sold and delete all contents in the user'cart-> return empty cart
router.post('/successBuy', auth, (req, res) => {

    //1. Store brief payment info to the user's collection 
    let history = [];
    let transactionData = {};

    req.body.cartDetail.forEach((item) => {
        history.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })

    //2. Give Detaile payment info
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }

    transactionData.data = req.body.paymentData
    transactionData.product = history

    //Sotre to the history
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: history }, $set: { cart: [] } },
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err })

            //store transactionData info to the payment  
            const payment = new Payment(transactionData)
            payment.save((err, doc) => {
                if (err) return res.json({ success: false, err })

                //3. Count +1 product's sold 

                let products = [];
                doc.product.forEach(item => {
                    products.push({ id: item.id, quantity: item.quantity })
                })
                //
                async.eachSeries(products, (item, callback) => {

                    Product.update(
                        { _id: item.id },
                        {
                            $inc: {
                                "sold": item.quantity
                            }
                        },
                        { new: false },
                        callback
                    )
                }, (err) => {
                    if (err) return res.status(400).json({ success: false, err })
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                }
                )
            })
        }
    )
})

// Google login (Receive: access token / Return: User info)
// Trigger -> receive:token -> if new user, store to db and return user info or just return user info -> return userinfo
router.post('/google', async (req, res) => {

    const client = new OAuth2Client(process.env.CLIENT_ID)
    //verify Token 
    const { token } = req.body
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    // get user info from google
    const googleUserInfo = ticket.getPayload();

    //Search user info
    User.findOne({ email: googleUserInfo.email }, (err, user) => {
        //if user info doesn't exists
        if (!user) {
            const newUser = new User({
                name: googleUserInfo.given_name,
                email: googleUserInfo.email,
                password: googleUserInfo.sub,
                lastname: googleUserInfo.family_name,
                image: googleUserInfo.picture,
                oauth: true
            });

            newUser.save((err, doc) => {
                if (err) return res.json({ success: false, err });
                newUser.generateToken((err, user) => {
                    if (err) return res.status(400).send(err);
                    res.cookie("w_authExp", user.tokenExp);
                    res
                        .cookie("w_auth", user.token)
                        .status(200)
                        .json({
                            loginSuccess: true, userId: user._id
                        });
                });

            });
        }
        //if user info exists, just compare password(sub info)
        else {
            user.comparePassword(googleUserInfo.sub, (err, isMatch) => {
                if (!isMatch)
                    return res.json({ loginSuccess: false, message: "Wrong google sub" });

                user.generateToken((err, user) => {
                    if (err) return res.status(400).send(err);
                    res.cookie("w_authExp", user.tokenExp);
                    res
                        .cookie("w_auth", user.token)
                        .status(200)
                        .json({
                            loginSuccess: true, userId: user._id
                        });
                });
            });
        }
    });
})
// fogot (Receive: email / Return: success(boolean) and err message) 
// receive: email, user want to find -> search the email and if it exists, return and send email with token (1hour validation)or not, send err with err message
router.post('/forgot', async (req, res) => {
    // find user by using email
    User.findOne(
        { email: req.body.email },
        (err, user) => {
            if (!user)
                return res.json({
                    success: false,
                    message: "Email doesn't exist, Please try again."
                });
            if (user.oauth) {
                return res.json({
                    success: false,
                    message: "This user is registered as a Google user, please contact Google OAuth team."
                });
            }
            //if email exists, request refreshToken to access google OAuth   
            const oAuth2Client = new google.auth.OAuth2(process.env.FORGOT_EMAIL_CLIENT_ID, process.env.FORGOT_EMAIL_SECRET, process.env.FORGOT_REDIRECT_URI)
            oAuth2Client.setCredentials({ refresh_token: process.env.FORGOT_EMAIL_REFRESH_TOKEN })

            // Generate Token to access the reset password PAGE
            const token = crypto.randomBytes(20).toString('hex');
            user.tokenExp = (moment().add(1, 'hour').valueOf()); //expired time 1 hour
            user.token = token;

            //store token to the DB
            user.save(function (err, user) {
                if (err) return res.status(400).json({ success: false, err })
                //send mail
                async function sendMail() {
                    try {
                        //generate access token from google
                        const accessToken = await oAuth2Client.getAccessToken();
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            port: 465,
                            secure: true, // true for 465, false for other ports
                            auth: {
                                type: "OAuth2",
                                user: process.env.FORGOT_EMAIL_ID,
                                clientId: process.env.FORGOT_EMAIL_CLIENT_ID,
                                clientSecret: process.env.FORGOT_EMAIL_SECRET,
                                refreshToken: process.env.FORGOT_EMAIL_REFRESH_TOKEN,
                                accessToken: accessToken
                            }
                        });
                        //Main contents
                        const mailOptions = {
                            from: process.env.FORGOT_EMAIL_ID,
                            to: user.email,
                            subject: 'Password search authentication code transmission',
                            text: 'This is the authentication code to find the password!',
                            html:
                                `<p>Hello ${user.name}</p>` +
                                `<p>Please click the URL to reset your password.<p>` +
                                `<a href='${process.env.DOMAIN}/resetpw/${token}/${user.email}'>Click here to reset Your Password</a><br/>` +
                                `If you don't request this, please contact us` +
                                `<h4> Dean's Canada Shop</h4>`
                        };

                        const result = transporter.sendMail(mailOptions);
                        return result;
                    } catch {
                        res.status(400).json({ success: false, message: 'Fail to Send Mail' });
                    }
                }
                //Executution
                sendMail()
                    .then(result => {
                        if (result)
                            return res.json({ success: true });
                        else res.status(400).json({ success: false, message: 'Fail to Send Mail' });
                    })
            })
        })
})

// Check token and then reset password / receive: token and email, send: success:true
router.post('/resetpw', auth, async (req, res) => {
    let user = req.user;
    user.password = req.body.password;
    user.save(function (err, user) {
        if (err) res.status(400).json({ error: true })
        res.status(200).json({ success: true, user: user })
    })
})


module.exports = router;
