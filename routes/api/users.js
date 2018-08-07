const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const user = require('../../models/User');
const bcrypt = require('bcryptjs');

router.get ('/test', (req, res) => res.json({msg: "Users Works"})
);

router.post('/register',(req, res)=>{
User.findOne({email: req.body.email})
    .then(user => {
        if(user) {
            return res.status(400).json({email:'Email Already exists'})
        } else {
            const avatar = gravatar.url(req.body.email, {
                s:'200', // avatar size
                r:'pg', //avatar rating
                d: 'mm' // default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.pass

            });
            bcrypt.genSalt(10, (err,salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
               if (err) throw err;
               newUser.password = hash;
               newUser.save()
                   .then(user => res.json(user))
                   .catch(err => console.log (err));
              })
            })
        }
    })
});

module.exports = router;
