const mongoose = require('mongoose');

const pokenSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    isPayed: {
        type: Boolean,
        required: true
    },
    subdomain: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})
const Poken = mongoose.model('Poken', pokenSchema);

async function createPoken(amount, subdomain) {
    const poken = new Poken({
        amount: amount,
        subdomain: subdomain,
        isPayed: false,
        date: new Date()
    });
    await poken.save();
    return poken;
}
async function getPoken(id) {
    return await Poken.findById(id);
}
async function payPoken(id) {
    await Poken.updateOne({ _id: id}, {
        $set: {
            isPayed: true
        }
    });
}
async function getPokens(subdomain) {
    return await Poken.find({ subdomain: subdomain })
}
module.exports.payPoken = payPoken;
module.exports.createPoken = createPoken;
module.exports.getPoken = getPoken;
module.exports.getPokens = getPokens;