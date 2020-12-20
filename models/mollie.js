const mognoose = require('mongoose');
// undecentralized.transaction.one
const mollie = mognoose.model('Mollie', new mognoose.Schema({
    mollieId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}));
module.exports.Shop = Shop;