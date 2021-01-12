const mongoose = require('mongoose');
const sellPriceSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
        default: 1
    }
});
const SellPrice = mongoose.model('SellPrice', sellPriceSchema);
async function getPrice() {
    const sellPrices = await SellPrice.find({});
    if(sellPrices.length == 0) {
        const sellPrice = new SellPrice({});
        await sellPrice.save();
    }
    return await SellPrice.findOne({});
}
module.exports.getPrice = getPrice;