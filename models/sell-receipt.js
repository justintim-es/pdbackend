const mongoose = require('mongoose');
const { getTransaction } = require('../ethereum/eth');

const sellReceiptSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    eur: {
        type: Number,
        required: true
    },
    wei: {
        type: Number,
        required: true
    },
    eth: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    contractAddress: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    payoutHash: String,
})
const SellReceipt = mongoose.model('SellReceipt', sellReceiptSchema);


async function createSellReceipt(seller, hash, eur, wei, eth, contractAddress) {
    const sellReceipt = new SellReceipt({
        seller: seller,
        hash: hash,
        eur: eur,
        wei: wei,
        eth: eth,
        date: new Date(),
        contractAddress: contractAddress
    });
    await sellReceipt.save();
}
async function getSellReceipts(seller) {
    return await SellReceipt.find({ seller: seller });
}
async function updateSellReceiptsPayoutHashContractAddress(contractAddress, payoutHash) {
    const sellReceipts = await SellReceipt.find({ contractAddress: contractAddress, payoutHash: null });
    for (let i = 0; i < sellReceipts.length; i++) {
        await getTransaction(sellReceipts[i].hash).then(async traschan => {
            if(traschan.blockNumber != null) await SellReceipt.updateOne({  _id: sellReceipts[i]._id }, {
                $set: {
                    payoutHash: payoutHash
                }
            })
        })
    }
}
async function updateSellReceiptsPayoutHashContractAddressPayoutHash(contractAddress, payoutHash, newPayoutHash) {
    await SellReceipt.updateMany({ contractAddress: contractAddress, payoutHash: payoutHash }, {
        $set: {
            payoutHash: newPayoutHash
        }
    })
}
async function getSellReceiptsSellerPayoutHash(seller) {
    return await SellReceipt.find({ seller: seller, payoutHash: { $ne: null }});
}
module.exports.createSellReceipt = createSellReceipt;
module.exports.getSellReceipts = getSellReceipts;
module.exports.updateSellReceiptsPayoutHashContractAddress = updateSellReceiptsPayoutHashContractAddress;
module.exports.updateSellReceiptsPayoutHashContractAddressPayoutHash = updateSellReceiptsPayoutHashContractAddressPayoutHash;
module.exports.getSellReceiptsSellerPayoutHash = getSellReceiptsSellerPayoutHash;