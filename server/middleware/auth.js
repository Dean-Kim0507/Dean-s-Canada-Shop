const { User } = require('../models/User');

const auth = (req, res, next) => {
  let token;
  let type;

  if (req.body.token) {
    token = req.body.token;
    type = 'random'
  }
  else if (req.cookies.w_auth) {
    token = req.cookies.w_auth;
    type = 'jwt';
  }


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
};


module.exports = { auth };
