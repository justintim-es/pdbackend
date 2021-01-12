const { create } = require('lodash');
const mongoose = require('mongoose');

const ethereumAccountTransactionSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        required: true,
        unique: true
    },
    market: {
        type: Number,
        required: true
    },
    amountEur: {
        type: Number,
        required: true
    },
    amountEth: {
        type: Number,
        required: true
    },
    amountWei: {
        type: Number,
        required: true
    },
    gasFeeEur: {
        type: Number,
        required: true
    },
    gasFeeEth: {
        type: Number,
        required: true
    },
    gasFeeWei: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});
const EthereumAccountTransaction = new mongoose.model('EthereumAccountTransaction', ethereumAccountTransactionSchema);
async function createEthereumAccountTransaction(account, hash, market, amountEur, amountEth, amountWei, gasFeeEur, gasFeeEth, gasFeeWei) {
    const ethereumAccountTransaction = new EthereumAccountTransaction({
        account: account,
        hash: hash,
        market: market,
        amountEur, amountEur,
        amountEth: amountEth,
        amountWei: amountWei,
        gasFeeEur: gasFeeEur,
        gasFeeEth: gasFeeEth,
        gasFeeWei: gasFeeWei,
        date: new Date()
    });
    await ethereumAccountTransaction.save();
    return ethereumAccountTransaction;
}
async function getEthereumAccountTransactions(account) {
    return await EthereumAccountTransaction.find({ account: account });
}
async function resendEthereumAccountTransaction(hash, gasFeeEur, gasFeeEth, gasFeeWei) {
    await EthereumAccountTransaction.updateOne({ hash: hash }, {
        $set: {
            gasFeeEur: gasFeeEur,
            gasFeeEth: gasFeeEth,
            gasFeeWei: gasFeeWei,
            date: new Date(),
        }
    });
}
module.exports.createEthereumAccountTransaction = createEthereumAccountTransaction;
module.exports.getEthereumAccountTransactions = getEthereumAccountTransactions;
module.exports.resendEthereumAccountTransaction = resendEthereumAccountTransaction;