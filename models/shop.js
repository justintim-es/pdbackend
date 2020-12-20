const mongoose = require('mongoose');
// undecentralized.transaction.one
const shopSchema = mongoose.model('Shop', new mongoose.Schema({
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
module.exports.shopSchema = shopSchema;