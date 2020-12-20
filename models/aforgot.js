const mongoose = require('mongoose');

const aforgotSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
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
const Aforgot = mongoose.model('Aforgot', aforgotSchema);

async function createAforgot(code, account) {
    const af = await Aforgot.findOne({ account: account });
    if(af != null) await Aforgot.deleteOne({ account: account });
    const aforgot = new Aforgot({
        code: code,
        isConfirmed: false,
        account: account,
        isUsed: false
    });
    await aforgot.save();
}
async function confirmAforgot(code) {
    await Aforgot.updateOne({ code: code }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function getAforgot(code) {
    return await Aforgot.findOne({ code: code })
}
async function useAforgot(code) {
    await Aforgot.updateOne({ code: code }, {
        $set: {
            isUsed: true
        }
    })
}
module.exports.createAforgot = createAforgot;
module.exports.confirmAforgot = confirmAforgot;
module.exports.getAforgot = getAforgot;
module.exports.useAforgot = useAforgot;