const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const sellerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    phonenumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    ethereumAddress: {
        type: String,
        required: true
    },
    ethereumPassword: {
        type: String,
        required: true
    },
    txFee: {
        type: Number,
        required: true
    }
})
sellerSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
    return token;
}
const Seller = mongoose.model('Seller', sellerSchema);

async function createSeller(email, phonenumber, password, ethereumAddress, ethereumPassword) {
    const seller = new Seller({
        email: email,
        phonenumber: phonenumber,
        password: password,
        ethereumAddress: ethereumAddress,
        ethereumPassword: ethereumPassword,
        txFee: 150 
    });
    await seller.save();
    return seller;
}
async function getSeller(email) {
    return await Seller.findOne({ email: email });
}
async function count() {
    const sellers = await Seller.find();
    return sellers.length;
}
async function getSellerId(id) {
    return await Seller.findById(id);
}
async function updateSellerTxFee(id, txFee) {
    await Seller.updateOne({ _id: id}, {
        $set: {
            txFee: txFee
        }
    })
}
async function getSellerEmail(email) {
    return await Seller.findOne({ email: email });
}
async function updatePassword(id, password) {
    await Seller.updateOne({ _id: id }, {
        $set: {
            password: password
        }
    });
};
module.exports.createSeller = createSeller;
module.exports.getSeller = getSeller;
module.exports.count = count;
module.exports.getSellerId = getSellerId;
module.exports.updateSellerTxFee = updateSellerTxFee;
module.exports.getSellerEmail = getSellerEmail;
module.exports.updatePassword = updatePassword;