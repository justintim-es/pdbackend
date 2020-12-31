const { date } = require('joi');
const mongoose = require('mongoose');
const ethereumPayoutSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})
const EthereumPayout = mongoose.model('EthereumPayout', ethereumPayoutSchema);

async function createEthereumPayout(account, hash) {
    const ethereumPayout = new EthereumPayout({
        account: account,
        hash: hash,
        date: new Date()
    });
    await ethereumPayout.save();
}
module.exports.createEthereumPayout = createEthereumPayout;