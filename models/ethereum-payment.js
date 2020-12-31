const { create } = require('lodash');
const mongoose = require('mongoose');

const ethereumPaymentSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    requestWei: {
        type: Number,
        required: true
    },
    requestEth: {
        type: Number,
        requried: true
    },
    requestEur: {
        type: Number,
        required: true
    },
    isPayed: {
        type: Boolean,
        required: true
    },
    isBlockNumber: {
        type: Boolean,
        required: true
    },
    blockNumber: {
        type: Number,
        required: true
    },
    subdomain: {
        type: String,
        required: true
    }
});
const EthereumPayment = mongoose.model('EthereumPayment', ethereumPaymentSchema);

async function createEthereumPayment(account, package, customer, address, password, requestWei, requestEth, requestEur, subdomain) {
    const ethereumPayment = new EthereumPayment({
        account: account,
        package: package,
        customer: customer,
        address: address,
        password: password,
        requestWei: requestWei,
        requestEth: requestEth,
        requestEur: requestEur,
        isPayed: false,
        isBlockNumber: false,
        blockNumber: 0,
        subdomain: subdomain
    });
    await ethereumPayment.save();
    return ethereumPayment;
}
async function getEthereumPayment(address) {
    return await EthereumPayment.findOne({ address: address });
}
async function getEthereumPaymentById(id) {
    return await EthereumPayment.findOne({ _id: id });
}
async function blockNumberEthereumPayment(id, blockNumber) {
    await EthereumPayment.updateOne({ _id: id }, {
        $set: {
            blockNumber: blockNumber
        }
    })
}
async function isBlockNumberEthereumPaymentTrue(id) {
    await EthereumPayment.updateOne({ _id: id }, {
        $set: {
            isBlockNumber: true
        }
    })
}
async function payEthereumPayment(id) {
    await EthereumPayment.updateOne({ _id: id }, {
        $set: {
            isPayed: true
        }
    })
}
module.exports.createEthereumPayment = createEthereumPayment;
module.exports.getEthereumPayment = getEthereumPayment;
module.exports.payEthereumPayment = payEthereumPayment;
module.exports.blockNumberEthereumPayment = blockNumberEthereumPayment;
module.exports.isBlockNumberEthereumPaymentTrue = isBlockNumberEthereumPaymentTrue;
module.exports.getEthereumPaymentById = getEthereumPaymentById;