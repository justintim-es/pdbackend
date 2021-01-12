const mongoose = require('mongoose');

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
    }
})
const SellReceipt = mongoose.model('SellReceipt', sellReceiptSchema);


async function createSellReceipt(seller, hash, eur, wei, eth) {
    const sellReceipt = new SellReceipt({
        seller: seller,
        hash: hash,
        eur: eur,
        wei: wei,
        eth: eth,
        date: new Date()
    });
    await sellReceipt.save();
}
async function getSellReceipts(seller) {
    return await SellReceipt.find({ seller: seller });
}
module.exports.createSellReceipt = createSellReceipt;
module.exports.getSellReceipts = getSellReceipts;