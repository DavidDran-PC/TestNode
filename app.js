var express = require('express'),
    mongoose = require('mongoose');
var bodyParser = require('body-parser');

//---------------------------------------------------------
// DB connection stuff
//---------------------------------------------------------

var db;
var conHandler = function (err) {
    if (err) {
        global.mongooseup = false;
        console.log(err);
    } else {
        global.mongooseup = true;
    }
}
if (process.env.ENV == 'Test') {
    db = mongoose.connect('mongodb://localhost/PENSCO_Lib_Test', conHandler);
}
else {
    db = mongoose.connect('mongodb://localhost/PENSCO_Lib', conHandler);
}

//---------------------------------------------------------
// Model for DB
//---------------------------------------------------------
var Account = require('./models/accountModel');
//---------------------------------------------------------
// express
//---------------------------------------------------------
var app = express();

//---------------------------------------------------------
// !! Allowing for cross site requests
//---------------------------------------------------------
var cors = require('cors');
app.use(cors());
//---------------------------------------------------------

//---------------------------------------------------------
// Port
//---------------------------------------------------------
var port = process.env.port || 3005;

//---------------------------------------------------------
// JSON Parsing
//---------------------------------------------------------
app.use(bodyParser.json());

//---------------------------------------------------------
// Router stuff for the rest of the gets, posts and what not
//---------------------------------------------------------
var accountRouter = require('./routes/accountRoutes')(Account);
app.use('/api/accounts', accountRouter);

//---------------------------------------------------------
// Welcome route
//---------------------------------------------------------

app.get('/', function (req, res) {
    res.send('welcome to nodeapi -- gulp');
});

//---------------------------------------------------------
// Start listening
//---------------------------------------------------------
app.listen(port, function () {
    console.log('Running on port: ' + port);
});

module.exports = app;