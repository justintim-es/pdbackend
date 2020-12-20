const { create } = require('lodash');
const mongoose = require('mongoose');

const ethereumSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        required: true 
    },
    isCustomerPay: {
        type: Boolean,
        required: true
    }
});   
const Ethereum = mongoose.model('Ethereum', ethereumSchema);

async function createEthereum(account, address, isCustomerPay) {
    const ethereum = new Ethereum({
        account: account,
        address: address,
        isCustomerPay: isCustomerPay
    });
    await ethereum.save();
}
module.exports.createEthereum = createEthereum;