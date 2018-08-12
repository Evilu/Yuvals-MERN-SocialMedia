const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport')

//load input validation
const ValidateRegisterInput = require('../../validation/register')
const ValidateLoginInput = require('../../validation/login')

//Sanity check
router.get('/test', (req, res) => res.json({msg: "Users Works"})
);

//Register
router.post('/register', (req, res) => {
    const {errors, isValid} = ValidateRegisterInput(req.body)
    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    User.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                errors.email = 'Email already exists'
                return res.status(400).json(errors)
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Avatar size
                    r: 'pg', // Avatar rating
                    d: 'mm' // Default
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});

router.post('/login', (req, res) => {
    const {errors, isValid} = ValidateLoginInput(req.body)
    // Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find user by he's email
    User.findOne({email})
        .then(user => {
            // Check for user
            if (!user) {
                errors.email = 'User not found'
                return res.status(404).json(errors);
            }
            // Validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {  //User matched
                        const payload = {
                            id: user.id,// create JWT Payload
                            name: user.name,
                            avatar: user.avatar
                        };

                        // Sign Token
                        jwt.sign(payload,
                            keys.secretOrKey,
                            {expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                            });
                    } else {
                        errors.password = 'Password incorrect '
                        return res.status(400).json
                        (errors);
                    }
                })
        });
});

router.get('/current', passport.authenticate('jwt',{session:false}),(req,res) => {
res.json({
    id: req.user.id ,
    name: req.user.name,
    email: req.user.email
})
});

module.exports = router;
