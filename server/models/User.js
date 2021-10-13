const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require("moment");
//=================================
//         User Model
//   Author: Donghyun(Dean) Kim
//=================================

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
        required: true
    },
    password: {
        type: String,
        minglength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    // role: 0 - General User, 1 - Admin
    role: {
        type: Number,
        default: 0
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    image: String,

    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    },
    //Google login user - true or not
    oauth: {
        type: Boolean,
        default: false
    },
    recentlyViewed: {
        type: Array,
        default: []
    }
})

//=================================
//   User Model Schema Function
//      Frequently used methods
//=================================

// To check whether password is modeified or not, if password is chaged, password will be encrypted  
// Trigger -> check whether password was changed or not -> if it's modified encrypt and return next() or just return next()
userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        // console.log('password changed')
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
});

// compare the password, user typed in with password in the db  (parameters: Plain Password /Return: user boolean isMatch)
// Trigger -> get plain password -> decrypt and compare -> return isMath(boolean)
userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

//Generate Jeson Web Token (exp: 1hour) (Return: user info callback)
// Trigger -> just generate jwt token and store to the DB -> reutrn call back with user info
userSchema.methods.generateToken = function (cb) {
    let user = this;
    let oneHour = (moment().add(20, 'm').valueOf())  //expired time 20 minutes
    let token = jwt.sign({ _id: user._id.toHexString(), exp: (oneHour / 1000) }, process.env.JWT_SECRET)

    user.tokenExp = oneHour;
    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user);
    })
}

// Authenticate Token by using (parameters:token /Return: user info)
// jwt: jwt.verify
// random(Forgot password): compare a token with the token in the db (This token was stored when user type in a email in on the page of forgot password)
userSchema.statics.findByToken = function (data, cb) {
    let user = this;
    let token = data.token;
    let type = data.type;

    //Token type = jwt
    if (type == 'jwt') {
        jwt.verify(token, process.env.JWT_SECRET, function (err, decode) {
            user.findOne({ "_id": decode, "token": token }, function (err, user) {
                if (err) return cb(err);
                cb(null, user);
            })
        })
    } else if (type == 'random') {

        //Token type = random
        user.findOne({ "token": token }, function (err, user) {
            if (err) return cb(err);
            if (user.tokenExp >= moment().valueOf()) {
                cb(null, user)
            }
            else {
                cb(null, null)
            }
        })
    }
    else { cb(null, null) }
}

const User = mongoose.model('User', userSchema);

module.exports = { User }