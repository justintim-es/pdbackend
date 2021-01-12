const mongoose = require('mongoose');
const sforgotSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
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
const Sforgot = mongoose.model('SForgot', sforgotSchema);
async function createSForgot(code, seller) {
    const cf = await Sforgot.findOne({ seller: seller });
    if(cf != null) await Sforgot.deleteOne({ seller: seller });
    const sforgot = new Sforgot({
        code: code,
        seller: seller,
        isConfirmed: false,
        isUsed: false
    });
    await sforgot.save();
}
async function confirmSforgot(code) {
    await Sforgot.updateOne({ code: code }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function getSforgot(code) {
    return await Sforgot.findOne({ code: code });
}
async function useSforgot(code) {
    await Sforgot.updateOne({ code: code }, {
        $set: {
            isUsed: true
        }
    })
}
module.exports.createSforgot = createSForgot;
module.exports.confirmSforgot = confirmSforgot;
module.exports.getSforgot = getSforgot;
module.exports.useSforgot = useSforgot;
