const { stubString } = require('lodash');
const mongoose = require('mongoose');

const ethereumContractTxFeeSchema = new mongoose.Schema({
    ethereumPayment: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    txFeeEur: {
        type: Number,
        required: true
    },
    txFeeEth: {
        type: Number,
        required: true
    },
})
const EthereumContractTxFee = mongoose.model('EthereumContractTxFee', ethereumContractTxFeeSchema);

async function createEthereumContractTxFee(ethereumPayment, txFeeEur, txFeeEth) {
    const ethereumContractTxFee = new EthereumContractTxFee({
        ethereumPayment: ethereumPayment,
        txFeeEur: txFeeEur,
        txFeeEth: txFeeEth
    });
    await ethereumContractTxFee.save();
}
module.exports.createEthereumContractTxFee = createEthereumContractTxFee;