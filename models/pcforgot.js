const mongoose = require('mongoose');

const pcforgotSchema = new mongoose.Schema({
    phonenumber: {
        type: String,
        required: true,
        unique: true
    },
    code: {
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
})
const Pcforgot = mongoose.model('Pcforgot', pcforgotSchema);

async function createPcfrogot(phonenumber, code, secret) {
    const pc = await Pcforgot.findOne({ phonenumber: phonenumber });
    if(pc != null) await Pcforgot.deleteOne({ phonenumber: phonenumber });
    const pcforgot = new Pcforgot({
        phonenumber: phonenumber,
        code: code,
        secret: secret,
        isConfirmed: false,
        isUsed: false,
    });
    await pcforgot.save();
}
async function confirmPcForgot(code, secret) {
    const pc = await Pcforgot.findOne({ code: code, secret: secret });
    if(pc == null) throw new Error('Ongeldige verificatie code');
    await Pcforgot.updateOne({ code: code, secret: secret}, {
        $set: {
            isConfirmed: true
        }
    });
}
async function getPcforgot(code, secret) {
    return await Pcforgot.findOne({ code: code, secret: secret });
}
async function usePcforgot(code, secret) {
    await Pcforgot.updateOne({ code: code, secret, secret}, {
        $set: {
            isUsed: false
        }
    })
}
module.exports.createPcfrogot = createPcfrogot;
module.exports.confirmPcForgot = confirmPcForgot;
module.exports.getPcforgot = getPcforgot;
module.exports.usePcforgot = usePcforgot;