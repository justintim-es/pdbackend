const { required } = require('joi');
const mongoose = require('mongoose');

const paforgotSchema = new mongoose.Schema({
    phonenumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    secret: {
        type: String,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        required: true
    },
    isUsed: {
        type: Boolean,
        required: true
    }
});
const Paforgot = mongoose.model('Paforgot', paforgotSchema);

async function createPaforgot(phonenumber, password, secret) {
    const paf = await Paforgot.findOne({ phonenumber: phonenumber });
    if(paf != null) await Paforgot.deleteOne({ phonenumber, phonenumber });
    const paforgot = new Paforgot({
        phonenumber: phonenumber,
        password: password,
        isConfirmed: false,
        secret: secret,
        isUsed: false
    });
    await paforgot.save();
}
async function confirmPaforgot(password, secret) {
    await Paforgot.updateOne({ password: password, secret: secret }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function getPaforgot(password, secret) {
    return await Paforgot.findOne({ password: password, secret: secret });
}
async function usePaforgot(password, secret) {
    await Paforgot.updateOne({ password: password, secret, secret }, {
        $set: {
            isUsed: true
        }
    });
}
module.exports.createPaforgot = createPaforgot;
module.exports.confirmPaforgot = confirmPaforgot;
module.exports.getPaforgot = getPaforgot;
module.exports.usePaforgot = usePaforgot;