const mongoose = require('mongoose');
const ethereumSellerTransactionSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        required: true
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
const EthereumSellerTranaction = mongoose.model('EthereumSellerTransaction', ethereumSellerTransactionSchema);

async function createEthereumSellerTransaction(seller, hash, market, amountEur, amountEth, amountWei, gasFeeEur, gasFeeEth, gasFeeWei) {
    const ethereumSellerTransaction = new EthereumSellerTranaction({
        seller: seller,
        hash: hash,
        market: market,
        amountEur: amountEur,
        amountEth: amountEth,
        amountWei: amountWei,
        amountEur: amountEur,
        gasFeeEur: gasFeeEur,
        gasFeeEth: gasFeeEth,
        gasFeeWei: gasFeeWei,
        date: new Date()
    });
    await ethereumSellerTransaction.save();
    return ethereumSellerTransaction;
}
async function getEthereumSellerTransactions(seller) {
    return await EthereumSellerTranaction.find({ seller: seller });
}
async function updateEthereumSellerTransaction(seller, hash, gasFeeEur, gasFeeEth, gasFeeWei) {
    return await EthereumSellerTranaction.updateOne({ seller: seller }, {
        $set: {
            hash: hash,
            gasFeeEur: gasFeeEur,
            gasFeeEth: gasFeeEth,
            gasFeeWei: gasFeeWei
        }
    })
}
module.exports.createEthereumSellerTransaction = createEthereumSellerTransaction;
module.exports.getEthereumSellerTransactions = getEthereumSellerTransactions;
module.exports.updateEthereumSellerTransaction = updateEthereumSellerTransaction;