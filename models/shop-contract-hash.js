const mongoose = require('mongoose');

const shopContractHashSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contractHash: {
        type: String,
        required: true
    },
});
const ShopContractHash = mongoose.model('ShopContractHash', shopContractHashSchema);

async function createShopContractHash(account, contractHash) {
    const shopContract = new ShopContractHash({
        account: account,
        contractHash: contractHash
    });
    await shopContract.save();
}
async function updateShopContractHash(account, contractHash) {
    await ShopContractHash.updateOne({ account: account }, {
        $set: {
            contractHash: contractHash
        }
    })
}
async function getShopContractHashAccount(account) {
    return await ShopContractHash.findOne({ account: account });
}
module.exports.createShopContractHash = createShopContractHash;
module.exports.updateShopContractHash = updateShopContractHash;
module.exports.getShopContractHashAccount = getShopContractHashAccount;