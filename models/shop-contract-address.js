const mongoose = require('mongoose');

const shopContractAddressSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contractAddress: {
        type: String,
        required: true
    },
    serviceFee: {
        type: Number,
        required: true
    }
})
const ShopContractAddress = mongoose.model('ShopContractAddress', shopContractAddressSchema);

async function createShopContractAddress(account, contractAddress) {
    const shopContractAddress = new ShopContractAddress({
        account: account,
        contractAddress: contractAddress,
        serviceFee: 200
    });
    await shopContractAddress.save();
}
async function getShopContractAddressAccount(account) {
    return await ShopContractAddress.findOne({ account: account });
}
async function updateShopContractAddressAccountServiceFee(account, serviceFee) {
    await ShopContractAddress.updateOne({ account: account }, {
        $set: {
            serviceFee: serviceFee
        }
    })
}
module.exports.createShopContractAddress = createShopContractAddress;
module.exports.getShopContractAddressAccount = getShopContractAddressAccount;
module.exports.updateShopContractAddressAccountServiceFee = updateShopContractAddressAccountServiceFee;