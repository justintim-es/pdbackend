const mognoose = require('mongoose');
// undecentralized.transaction.one
const testMollie = mognoose.model('Test-Mollie', new mognoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    dbId: {
        type: String,
        required: true
    }
}));
module.exports.Shop = Shop;