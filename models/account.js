const config = require('config');
const jwt = require('jsonwebtoken');
const { find } = require('lodash');
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
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
        required: true,
    },
    tradeName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    houseNumber: {
        type: Number,
        required: true
    },
    postCode: {
        type: String,
        required: true
    },
    subdomain: {
        type: String,
        required: true,
        unique: true
    },
    ethereumAddress: {
        type: String,
        required: true,
        unique: true
    },
    ethereumPassword: {
        type: String,
        required: true
    },
    isSubdomain: {
        type: Boolean,
        required: true
    },
    isSells: {
        type: Boolean,
        required: true
    },
    sells: {
        type: mongoose.Schema.Types.ObjectId,
    }
})
accountSchema.methods.genereateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
    return token;
}
const Account = mongoose.model('Account', accountSchema);

async function createAccount(email, phonenumber, password, tradeName, address, houseNumber, postCode, subdomain, ethereumAddress, ethereumPassword) {
    const account = new Account({
        email: email,
        phonenumber: phonenumber,
        password: password,
        tradeName: tradeName,
        address: address,
        houseNumber: houseNumber,
        postCode: postCode,
        subdomain: subdomain,
        ethereumAddress: ethereumAddress,
        ethereumPassword: ethereumPassword,
        isSells: false,
        isSubdomain: false
    });
    await account.save();
    return account;
}
async function createSellsAccount(email, phonenumber, password, tradeName, address, houseNumber, postCode, subdomain, ethereumAddress, ethereumPassword, sells) {
    const account = new Account({
        email: email,
        phonenumber: phonenumber,
        password: password,
        tradeName: tradeName,
        address: address,
        houseNumber: houseNumber,
        postCode: postCode,
        subdomain: subdomain,
        ethereumAddress: ethereumAddress,
        ethereumPassword: ethereumPassword,
        isSells: true,
        sells: sells
    });
    await account.save();
    return account;
}
async function findOne(email) {
    const account = await Account.findOne({ email: email });
    return account;
}
async function findBySubdomain(subdomain) {
    return await Account.findOne({ subdomain: subdomain });
}
async function findById(id) {
    return await Account.findById(id);
}
async function updatePassword(phonenumber, password) {
    await Account.updateOne({ phonenumber: phonenumber }, {
        $set: {
            password: password
        }
    });
}
async function getAccounts() {
    return await Account.find();
}
async function updateEthereum(id) {
    await Account.updateOne({ _id: id}, {
        $set: {
            isEthereum: true
        }
    })
}
module.exports.createAccount = createAccount;
module.exports.findOne = findOne;
module.exports.findBySubdomain = findBySubdomain;
module.exports.findById = findById;
module.exports.updatePassword = updatePassword;
module.exports.getAccounts = getAccounts;
module.exports.updateEthereum = updateEthereum;