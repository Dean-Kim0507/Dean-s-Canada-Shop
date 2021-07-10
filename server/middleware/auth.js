const { User } = require('../models/User');
const { redis_client, cachingTokenData } = require('../config/redis')
const jwt = require('jsonwebtoken');
const moment = require('moment')
const async = require('async');
//=================================
//             Auth
// User Authentication by using JWT or RandomToken(Forgot password link token)
//=================================

//Returning User model itself
const auth = (req, res, next) => {

  if (req.user) next();
  //Token from client side(it should be carried by cookie or header)
  let token;

  // Token type - jwt; usual / random: a token for a link when user forgot a apssword
  let type;

  //Distribute Token type
  if (req.body.token) {
    token = req.body.token;
    type = 'random'
  }
  else if (req.cookies.w_auth) {
    token = req.cookies.w_auth;
    type = 'jwt';
  }
  else return res.json({
    isAuth: false,
    error: true
  })
  //Making Object to send it to user model

  // Compare Token (Return: user object)
  // jwt: authenticate token by using jwt.verify
  // random: compare token with a token that is stored to the db
  const data = {
    token: token,
    type: type
  }
  User.findByToken(data, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true
      });
    req.token = token;
    req.user = user;
    next();
  });
}

//=================================
//             Cache
// Store frequently used data to the redis
//=================================
// 1 - _id, isAdmin, isAuth, email, name, lastname, role, image,
// 2 - 1 + cart, history

const cache = (opt) => {
  return async (req, res, next) => {

    if (!req.cookies.w_auth) return res.json({ isAuth: false, error: true })
    let token = req.cookies.w_auth;
    let tokenExp = req.cookies.w_authExp;

    //If token is expired, token Refresh
    if (tokenExp <= moment().valueOf()) {
      redis_client.hget('data', 'tokenData', (err, data) => {
        //If there is no token data in the cache
        if (!data) return res.json({ isAuth: false, error: true })
        const tData = JSON.parse(data)
        //If the time exceed 10minutes
        let tenM = ((moment().valueOf() - tData.tokenExp) / 1000) < 600;

        //If it's expired before ten minutes it will return true to fresh
        if (tData.token == token && tData.tokenExp == tokenExp && tenM) {
          //Find a user by using token
          User.findOne({ token: token }, function (err, user) {
            if (err) return res.json({ isAuth: false, error: true })
            //Generate a new Token
            user.generateToken((err, newUser) => {
              if (err) return res.status(400).send(err);
              //Reset the data to cache server
              cachingTokenData(newUser);
              //Reset cookies
              res.cookie("w_authExp", newUser.tokenExp)
              res.cookie("w_auth", newUser.token)
              req.token = newUser.token;
              req.tokenExp = newUser.tokenExp;
              //Return user info
              req.user = newUser;
              next();
            })
          })
        }
        //if token is not qalified
        else return res.json({ isAuth: false, error: true })
      })
    }

    //If token is not expired
    //if Option is 1 or 2, it doesn't need to access DB, just get data from Redis
    else {
      jwt.verify(token, process.env.JWT_SECRET, function (err, decode) {
        if (err) return res.json({ isAuth: false, error: true })
        //Get a token data from redis
        redis_client.hget('data', 'tokenData', async (err, data) => {
          if (err) return res.json({ isAuth: false, error: true })
          const tData = JSON.parse(data)
          //Validate if token is the same as what chache has
          if (tData.token != token) return res.json({ isAuth: false, error: true })

          //If opt is 2 it returns userData and cardData
          if (opt === 2) {
            redis_client.hmget('data', 'userData', 'cartData', (err, data) => {
              const ucData = {
                ...JSON.parse(data[0]), ...JSON.parse(data[1])
              }
              if (ucData._id != decode._id) return res.json({ isAuth: false, error: true })
              req.token = token;
              req.user = ucData;
              return next();
            })
          } else {
            //If opt is 1
            redis_client.hget('data', 'userData', (err, data) => {
              if (err) return res.json({ isAuth: false, error: true })
              const uData = JSON.parse(data)
              if (uData._id != decode._id) return res.json({ isAuth: false, error: true })
              req.token = token;
              req.user = uData;
              return next();
            })
          }
        })
      });
    }
  }
}


module.exports = { auth, cache };
