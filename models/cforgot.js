const mongoose = require('mongoose');

const cforgotSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    customer: {
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
});
const Cforgot = mongoose.model('Cforgot', cforgotSchema);
async function createCforgot(code, customer) {
    const cf = await Cforgot.findOne({ customer: customer });
    if(cf != null) await Cforgot.deleteOne({ customer: customer });
    const cforgot = new Cforgot({
        code: code,
        customer: customer,
        isConfirmed: false,
        isUsed: false
    });
    await cforgot.save();
}
async function confirmCforgot(code) {
    await Cforgot.updateOne({ code: code }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function getCforgot(code) {
    return await Cforgot.findOne({ code: code });
}
async function useCforgot(code) {
    await Cforgot.updateOne({ code: code }, {
        $set: {
            isUsed: true
        }
    })
}
module.exports.createCforgot = createCforgot;
module.exports.confirmCforgot = confirmCforgot;
module.exports.getCforgot = getCforgot;
module.exports.useCforgot = useCforgot;