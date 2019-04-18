var should = require('should'),
    sinon = require('sinon');

describe('PENSCO Tests:', function () {
    describe('Post', function () {

    //---------------------------------------------------------
    // POST Test
    //---------------------------------------------------------
        it('should not allow an empty title on post', function () {
            var Account = function (account) { this.save = function () { } };

            var req = {
                body: {
                    userId: '',
                    stockId: 'FOR',
                    purchaseAmount: '100',
                    datetime: ''
                }
            }
            var res = {
                status: sinon.spy(),
                send: sinon.spy(),
                jsonp: sinon.spy()
            };
            var accountController = require('../controllers/accountController')(Account);
            accountController.post(req, res);
            console.log('res.status = ' + res.send);
            res.status.calledWith(400).should.equal(true, 'Bad Status');
        });
    });
});