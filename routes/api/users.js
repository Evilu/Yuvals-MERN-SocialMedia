const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');

//sanity check
router.get('/test', (req, res) => res.json({msg: "Users Works"})
);

//register
router.post('/register', (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                return res.status(400).json({email: 'Email Already exists'})
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // avatar size
                    r: 'pg', //avatar rating
                    d: 'mm' // default
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
    const email = req.body.email;
    const password = req.body.password;

    //find user by he's email
    User.findOne({email})
        .then(user => {
            // check for user
            if (!user) {
                return res.status(404).json({email: 'user not found'});
            }
            // validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {  //User matched
                        const payload = {
                            id: user.id,// create JWT Payload
                            name: user.name,
                            avatar: user.avatar
                        };
                        // sign Token
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
                        return res.status(400).json
                        ({password: 'password incorrect '});
                    }
                })
        });
});


module.exports = router;
