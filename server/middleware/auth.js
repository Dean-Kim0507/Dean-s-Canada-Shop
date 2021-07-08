const { User } = require('../models/User');
const client = require('../config/redis')
const jwt = require('jsonwebtoken');
//=================================
//             Auth
// User Authentication by using JWT or RandomToken(Forgot password link token)
//=================================

//Returning info data 
// 1 - _id, isAdmin, isAuth, email, name, lastname, role, image,
// 2 - 1 + cart, history
// 3 - User model itself
const auth = (opt) => {
  return async (req, res, next) => {
    console.log('opt: ', opt)

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
      let tokenExp;
      //if Option is 1 or 2, it doesn't need to access DB, just get data from Redis
      if (opt === 1 || opt === 2) {
        jwt.verify(token, process.env.JWT_SECRET, function (err, decode) {
          if (err) return res.json({ isAuth: false, error: true })
          client.hget('data', 'tokenData', async (err, data) => {
            const tData = JSON.parse(data)
            tokenExp = tData.tokenExp;
            if (tData.token != token) return res.json({ isAuth: false, error: true })
            if (opt === 2) {
              client.hmget('data', 'userData', 'cartData', (err, data) => {
                const ucData = {
                  ...JSON.parse(data[0]), ...JSON.parse(data[1])
                }
                if (ucData._id != decode._id) return res.json({ isAuth: false, error: true })
                req.token = token;
                req.user = ucData;
                return next();
              })
            } else {
              client.hmget('data', 'userData', (err, data) => {
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
    else return res.json({
      isAuth: false,
      error: true
    })
    //Making Object to send it to user model

    if (opt === 3) {
      // Compare Token (Return: user object)
      // jwt: authenticate token by using jwt.verify
      // random: compare token with a token that is stored to the db
      const data = {
        token: token,
        type: type
      }
      await User.findByToken(data, (err, user) => {
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
    };
  }
}

module.exports = { auth };
