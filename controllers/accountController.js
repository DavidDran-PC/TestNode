var accountController = function (Account) {

    var post = function (req, res) {
        console.log("in post");
        var account = new Account(req.body);
        var str = validateIt(req)
        if (str) {
            res.status(400);
            res.jsonp(str);
        } 
        else {
            if (global.mongooseup){
                account.datetime=(new Date()).toJSON().slice(0, 19);
                account.save().catch((err) => {
                    res.status(500);
                    res.jsonp("error saving");
                });
                res.status(201);
                res.jsonp(account);
            }
            else {
                res.status(500).jsonp(JSON.stringify("mongoose is down"));
            }
        }
    };

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

    var getone = function (req, res) {
        res.jsonp(req.account);
    };

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
                req.account.save(function (err) {
                    if (err) {
                        console.log("err");
                        res.status(500).jsonp(JSON.stringify(err));
                    }
                    else {
                        res.jsonp(req.account);
                    }
                });
            }
            else {
                res.status(500).jsonp(JSON.stringify("mongoose is down"));
            }
        }        
    };

    var patch = function (req, res) {
        deleteit
        if (req.body._id) {
            delete req.body._id;
        }
        for (var p in req.body) {
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

    return {
        post: post,
        get: get,
        use: use,
        getone: getone,
        put: put,
        patch: patch,
        deleteit: deleteit
    };

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
        if (!req.body.purchaseAmount || req.body.purchaseAmount === "") {
            str = str + JSON.stringify('Purchase Amount is required');
        }
        else {
            if (!/\d.\d/.test(req.body.purchaseAmount))
            {
                str = JSON.stringify('Purchase Amount must be numeric ');
            }
        }
        return str;
    }
};

module.exports = accountController;