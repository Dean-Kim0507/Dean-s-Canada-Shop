const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require("moment");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minglength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
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
    recentlyViewed: {
        type: Array,
        default: []
    }
})


userSchema.pre('save', function (next) {
    let user = this;
    console.log('isModified: ', user.isModified('password'))
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

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function (cb) {
    let user = this;
    let oneHour = (moment().add(1, 'hour').valueOf()) / 1000; //expired time 1 hour
    let token = jwt.sign({ _id: user._id.toHexString(), exp: oneHour }, process.env.JWT_SECRET)

    user.tokenExp = oneHour;
    user.token = token;
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (data, cb) {
    let user = this;
    let token = data.token;
    let type = data.type;

    if (type == 'jwt') {
        jwt.verify(token, process.env.JWT_SECRET, function (err, decode) {
            user.findOne({ "_id": decode, "token": token }, function (err, user) {
                if (err) return cb(err);
                cb(null, user);
            })
        })
    } else {

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
}

const User = mongoose.model('User', userSchema);

module.exports = { User }