const mongoose = require('mongoose');

const mollieKeySchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    }
})
const MollieKey = mongoose.model('MollieKey', mollieKeySchema);

async function createMollieKey(account, key) {
    const mollieKey = new MollieKey({
        account: account,
        key: key
    });
    await mollieKey.save();
}
async function getMollieKey(account) {
    return await MollieKey.findOne({ account: account });
}
module.exports.createMollieKey = createMollieKey;
module.exports.getMollieKey = getMollieKey;