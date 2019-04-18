var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var accountModel = new Schema({
    userId: { type: String },
    stockId: { type: String },
    purchaseAmount: { type: Number },
    price: { type: Number },
    shares: { type: Number },
    datetime: { type: String }
});
module.exports = mongoose.model('Account', accountModel);