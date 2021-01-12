const mongoose = require('mongoose');
const sellEthSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    requestEur: {
        type: Number,
        required: true
    },
    requestEth: {
        type: Number,
        required: true
    },
    requestWei: {
        type: Number,
        required: true
    },
    isPayed: {
        type: Number,
        required: true
    },
    blockNumber: Number
});
const SellEth = mongoose.model('SellEth', sellEthSchema);

async function createSellEth(code, address, password, requestEur, requestEth, requestWei) {
    const se = await SellEth.findOne({ code: code });
    if(se == null) {
        const sellEth = new SellEth({
            code: code,
            address: address,
            password: password,
            requestEur: requestEur,
            requestEth: requestEth,
            requestWei: requestWei,
            isPayed: false
        });
        await sellEth.save();
        return sellEth;
    } else {
        await SellEth.updateOne({ code: code }, {
            requestEur: requestEur,
            requestEth: requestEth,
            requestWei: requestWei
        });
        return se;
    }
}
async function getSellEthAddress(address) {
    return await SellEth.findOne({ address: address });
}
async function paySellEth(id) {
    await SellEth.updateOne({ _id: id }, {
        isPayed: true,
    })
}
async function sellEthBlockNumber(id, blockNumber) {
    await SellEth.updateOne({ _id: id }, {
        blockNumber: blockNumber,
    })
}
async function getSellEthCode(code) {
    return await SellEth.findOne({ code: code });
}
module.exports.createSellEth = createSellEth;
module.exports.getSellEthAddress = getSellEthAddress;
module.exports.paySellEth = paySellEth;
module.exports.sellEthBlockNumber = sellEthBlockNumber;
module.exports.getSellEthCode = getSellEthCode;