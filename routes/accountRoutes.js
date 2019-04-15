var express = require('express');
var routes = function(Account){

    var accountRouter = express.Router();
    var accountController = require('../controllers/accountController')(Account);

    console.log(" accountController-- " + accountController);

    accountRouter.route('/')
        .post(accountController.post)
        .get(accountController.get);
    accountRouter.use('/:accountId', accountController.use);
    accountRouter.route('/:accountId')
        .get(accountController.getone)
        .put(accountController.put) 
        .patch(accountController.patch)
        .delete(accountController.deleteit);

    return accountRouter;
};

module.exports = routes;