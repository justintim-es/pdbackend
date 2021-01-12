const mongoose = require('mongoose');

const psForgotSchema = new mongoose.Schema({
    phonenumber: {
        type: String,
        required: true
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
});
const Psforgot = mongoose.model('Psforgot', psForgotSchema);

async function createPsfrogot(phonenumber, code, secret) {
    const pc = await Psforgot.findOne({ phonenumber: phonenumber });
    if(pc != null) await Psforgot.deleteOne({ phonenumber: phonenumber });
    const pcforgot = new Psforgot({
        phonenumber: phonenumber,
        code: code,
        secret: secret,
        isConfirmed: false,
        isUsed: false,
    });
    await pcforgot.save();
}
async function confirmPsForgot(code, secret) {
    const pc = await Psforgot.findOne({ code: code, secret: secret });
    if(pc == null) throw new Error('Ongeldige verificatie code');
    await Psforgot.updateOne({ code: code, secret: secret}, {
        $set: {
            isConfirmed: true
        }
    });
}
async function getPsforgot(code, secret) {
    return await Psforgot.findOne({ code: code, secret: secret });
}
async function usePsforgot(code, secret) {
    await Psforgot.updateOne({ code: code, secret, secret}, {
        $set: {
            isUsed: false
        }
    })
}
module.exports.createPsfrogot = createPsfrogot;
module.exports.confirmPsForgot = confirmPsForgot;
module.exports.getPsforgot = getPsforgot;
module.exports.usePsforgot = usePsforgot;