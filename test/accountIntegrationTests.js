var should = require('should'),
    request = require('supertest'),
    app = require('../app.js'),
    mongoose = require('mongoose'),
    Account = mongoose.model('Account'),
    agent = request.agent(app);
var tempid = '';
    
describe('Account Test', function(){
    it('Should allow a purchase to be posted and return a read and _id', function(done){
        var accountPost = {
            userId: 'asdf',
            stockId: 'FOR',
            purchaseAmount: '100',
            datetime: ''};
        global.mongooseup = true;
        agent.post('/api/accounts')
        .send(accountPost)
        .expect(200)
        .end(function(err, results){
            console.log(JSON.stringify(results.body));
            results.status.should.equal(201);
            results.body.should.have.property('_id');
            tempid = results.body._id;
            done();
        });
    });

    it('Should allow a purchase to be changed and return a read and _id', function(done){
        var accountPost = {
            _id: tempid,
            userId: 'asdf',
            stockId: 'FOR',
            purchaseAmount: '200',
            datetime: ''};

        agent.put('/api/accounts/' + tempid)
        .send(accountPost)
        .expect(200)
        .end(function(err, results){
            results.status.should.equal(200);
            results.body.should.have.property('_id');
            results.body.should.have.property('purchaseAmount');
            results.body.purchaseAmount.should.equal('200');
            done();
        });

    });
    
    it('Should allow a purchase to be deleted', function(done){
        var accountPost = {
            _id: tempid,
            userId: 'asdf',
            stockId: 'FOR',
            purchaseAmount: '200',
            datetime: ''};

        agent.delete('/api/accounts/' + tempid)
        .send(accountPost)
        .expect(200)
        .end(function(err, results){
            console.log("---- begin --- " + tempid)
            console.log(JSON.stringify(results.body));
            console.log("---- begin ---");
            results.status.should.equal(202);
            results.body.should.have.property('message');
            results.body.message.should.equal('deleted it');
            done();
        });

    });

    /* remove everything once all tests are done (not aftereach) */ 
    
    after(function(done){
        Account.remove().exec();
        done();
    });
});