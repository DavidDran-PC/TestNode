var accountController = function (Account) {
    var https = require("https");
    var iextradingUrl = 'https://api.iextrading.com/1.0';

    //---------------------------------------------------------
    // POST
    //---------------------------------------------------------
    var post = function (req, res) {
        console.log("in post ");
        
        var account = new Account(req.body);
        console.log("in post " + account.stockId);
        var str = validateIt(req)
        if (str) {
            res.status(400);
            res.jsonp(str);
        } 
        else {
            if (global.mongooseup){
                account.datetime=(new Date()).toJSON().slice(0, 19);
                getPrice(account, res);
                
            }
            else {
                res.status(500).jsonp(JSON.stringify("mongoose is down"));
            }
        }
    };

    //---------------------------------------------------------
    // GET
    //---------------------------------------------------------
    var get = function (req, res) {
        console.log("in get query="+ JSON.stringify(req.query) + "  " + Object.keys(req.query).length + " " + req.query.stockId);
        if (Object.keys(req.query).length==0 ||(Object.keys(req.query).length == 1 && req.query.stockId) ){
           if (global.mongooseup){
                Account.find(req.query, function (err, accounts) {
                    if (err) {
                        console.log("in error");
                        res.status(500).jsonp(JSON.stringify(err));
                    }
                    else {
                        res.send(accounts);
                    }
                })
            } else {
                res.status(500).jsonp(JSON.stringify("mongoose is down"));
            }
        } else {
            res.status(500).jsonp(JSON.stringify("Invalid Search"));
        }
    };

    //---------------------------------------------------------
    // Use
    //---------------------------------------------------------
    use = function (req, res, next) {
        console.log("in use");
        if (global.mongooseup){
            Account.findById(req.params.accountId, function (err, account) {
                if (err) {
                    res.status(500).jsonp(JSON.stringify(err));
                }
                else if (account) {
                    req.account = account;
                    next();
                }
                else {
                    res.status(404).jsonp('no account found');
                }
            });
        }
        else {
            res.status(500).jsonp(JSON.stringify("mongoose is down"));
        }
    };

    //---------------------------------------------------------
    // getone
    //---------------------------------------------------------
    var getone = function (req, res) {
        res.jsonp(req.account);
    };

    //---------------------------------------------------------
    // PUT  Normally on a transaction we wouldnt want changes or deletes allowed on the front end
    //      like this unless this was a super user. I just wanted to show it.
    //---------------------------------------------------------
    var put = function (req, res) {
        console.log("in put");
        var str = validateIt(req)
        if (str) {
            res.status(400);
            res.jsonp(str);
        }  else {
            if (global.mongooseup){
                req.account.userId = req.body.userId;
                req.account.stockId = req.body.stockId;
                req.account.purchaseAmount = req.body.purchaseAmount;
                req.account.datetime=(new Date()).toJSON().slice(0, 19);
                getPrice(req.account, res);
            }
            else {
                res.status(500).jsonp(JSON.stringify("mongoose is down"));
            }
        }        
    };

    //---------------------------------------------------------
    // PATCH
    //---------------------------------------------------------
    var patch = function (req, res) {
        deleteit
        if (req.body._id) {
            delete req.body._id;
        }
        for (var p in req.body) {
            console.log("req.body[p]=" + JSON.stringify(req.body[p]));
            req.account[p] = req.body[p];
            req.account.datetime=(new Date()).toJSON().slice(0, 19);
        }
        req.account.save(function (err) {
            if (err) {
                console.log(err);
                res.status(500).jsonp(JSON.stringify(err));
            }
            else {
                res.jsonp(JSON.stringify(req.account));
            }
        });
    };

    //---------------------------------------------------------
    // DELETE
    //---------------------------------------------------------
    var deleteit = function (req, res) {
        console.log("in deleteit");
        req.account.remove(function (err) {
            if (err) {
                console.log(err);
                res.status(500).jsonp(JSON.stringify(err));
            }
            else {
                res.status(202).jsonp({ "message": "deleted it" });
            }
        });
    };

    //---------------------------------------------------------
    // returns
    //---------------------------------------------------------
    return {
        post: post,
        get: get,
        use: use,
        getone: getone,
        put: put,
        patch: patch,
        deleteit: deleteit
    };

    //---------------------------------------------------------
    // Functions
    //---------------------------------------------------------
    function validateIt(req) {
        var str = "";
        if (!req.body.userId || req.body.userId === "") {
            str = JSON.stringify('User Id is required ');
        } 
        if (!req.body.stockId || req.body.stockId === "") {
            str = str + JSON.stringify('Stock Id is required ' );
        } else {
            if (!/^[A-Z]{1,6}$/.test(req.body.stockId))
            {
                str = JSON.stringify('Stock Id must be no more than 6 chars upper case ');
            }
        }
        if (typeof req.body.purchaseAmount ==='undefined' || req.body.purchaseAmount <= 0) {
            console.log("in validateIt purchase amount= "+req.body.purchaseAmount);
            str = str + JSON.stringify('Purchase Amount is required and cannot be less than or equal to zero');
        }
        else {
            console.log(req.body.purchaseAmount);
            if (!/\d/.test(req.body.purchaseAmount))
            {
                str = JSON.stringify('Purchase Amount must be numeric ');
            }
        }
        return str;
    }
    
    function getPrice(account, resp, msg){
        console.log("in getPrice account.stockid="+ account.stockId);
         var fullurl = iextradingUrl +'/stock/'+account.stockId+'/price';
        https.get(fullurl, function(res,error){
            var body = "";
            res.on('data', function(data) {
              body += data;
            });
            res.on('end', function() {
                account.price = body;
                account.shares = Math.round((account.purchaseAmount/body)*1000.0) /1000.0;
                account.save().catch((err) => {
                    resp.status(500);
                    resp.jsonp("error saving");
                });
                resp.status(201);
                resp.jsonp(account);
              console.log(body);
              //console.log(JSON.stringify(account));
            });
            res.on('error', function(e) {
              console.log(e.message);
              resp.status(500);
              resp.jsonp(e.message);
            });
        })
    }
};


module.exports = accountController;