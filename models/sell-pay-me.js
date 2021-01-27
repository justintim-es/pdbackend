const mongoose = require('mongoose');
const sellPayMeSchema = new mongoose.Schema({
    hash: {
        required: true,
        type: String
    },
    date: {
        type: Date,
        required: true
    }
})
const SellPayMe = mongoose.model('SellPayMe', sellPayMeSchema);

async function createSellPayMe(hash) {
    const sellPayMe = new SellPayMe({
        hash: hash,
        date: new Date()
    });
    await sellPayMe.save();
}
module.exports.createSellPayMe = createSellPayMe;