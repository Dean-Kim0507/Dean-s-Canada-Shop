const { User } = require('../models/User');

//=================================
//             User
// User Authentication by using JWT or RandomToken(Forgot password link token)
//=================================

const auth = (req, res, next) => {

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
  const data = {
    token: token,
    type: type
  }

  //Compare Token (Return: user object)
  // jwt: authenticate token by using jwt.verify
  //random: compare token with a token that is stored to the db
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
};


module.exports = { auth };
