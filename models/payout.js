const { create } = require('lodash');
const mongoose = require('mongoose');
const payoutSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    ethShop: {
        type: Number,
        required: true
    },
    ethMe: {
        type: Number,
        required: true
    },
    eurShop: {
        type: Number,
        required: true
    },
    eurMe: {
        type: Number,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    transactionFeeEur: {
        type: Number,
        required: true
    },
    transactionFeeEth: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
})
const Payout = mongoose.model('Payout', payoutSchema);
async function createPayout(account, ethShop, ethMe, eurShop, eurMe, transactionFeeEur, transactionFeeEth, hash) { 
    const payout = new Payout({
        account: account,
        ethShop: ethShop,
        ethMe: ethMe,
        eurShop: eurShop,
        eurMe: eurMe,
        hash: hash,
        transactionFeeEur: transactionFeeEur,
        transactionFeeEth: transactionFeeEth,
        date: new Date(),
    });
    await payout.save()
}
async function getPayouts(account) {
    return await Payout.find({ account: account });
}
async function resendPayout(hash, transactionFeeEur, transactionFeeEth, newHash) {
    await Payout.updateOne({ hash: hash }, {
        $set: {
            transactionFeeEth: transactionFeeEth,
            transactionFeeEur: transactionFeeEur,
            hash: newHash
        }
    })
}
module.exports.createPayout = createPayout;
module.exports.getPayouts = getPayouts;
module.exports.resendPayout = resendPayout;
