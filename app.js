var express = require('express'),
    mongoose = require('mongoose');
var bodyParser = require('body-parser');

var db;
var conHandler = function(err)
{ 
    if (err) {
        global.mongooseup = false;
        console.log(err); 
    } else {
        global.mongooseup = true;
    }
}
if(process.env.ENV == 'Test'){
    db = mongoose.connect('mongodb://localhost/PENSCO_Lib_Test', conHandler);
}
else {
    db = mongoose.connect('mongodb://localhost/PENSCO_Lib', conHandler);
}

var Account = require('./models/accountModel');

var cors = require('cors');
var app = express();
app.use(cors());
var port = process.env.port || 3005;
app.use(bodyParser.json());


var accountRouter = require('./routes/accountRoutes')(Account);

app.use('/api/accounts', accountRouter);

app.get('/', function(req, res){
    res.send('welcome to nodeapi -- gulp');
});

app.listen(port, function(){
    console.log('Running on port: '+ port);
});

module.exports = app;