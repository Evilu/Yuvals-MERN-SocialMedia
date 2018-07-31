const express = require('express')
const mongoose = require('mongoose')
const app = express();

app.get('/',(req,res) => res.send('Hello World') );
//DB config
const db = require('./config/keys').mongoURI;
//connect to mongoDB
mongoose.
connect(db,{ useNewUrlParser: true })

    .then(()=> console.log('Mongodb connected'))
    .catch(err => console.log(err));
const port = process.env.PORT || 5000;

app.listen(port, ()=> console.log(`Server running on port ${port}`));