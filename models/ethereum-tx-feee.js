const mongoose = require('mongoose');

const ethereumTxFeeSchema = new mongoose.Schema({
    ethereumPayment: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    gasPrice: {
        type: Number,
        required: true
    },
    market: {
        type: Number,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    wei: {
        type: Number,
        required: true,
    }
});
const EthereumTxFee = mongoose.model('EthereumTxFee', ethereumTxFeeSchema);

async function createEthereumTxFee(ethereumPayment, gasPrice, market, hash, wei) {
    const ethereumTxFee = new EthereumTxFee({
        ethereumPayment: ethereumPayment,
        gasPrice: gasPrice,
        market: market,
        hash: hash,
        wei: wei
    });
    await ethereumTxFee.save();
}
async function getEthereumTxFee(ethereumPayment) {
    return await EthereumTxFee.find({ ethereumPayment: ethereumPayment });
}
module.exports.createEthereumTxFee = createEthereumTxFee;
module.exports.getEthereumTxFee = getEthereumTxFee;