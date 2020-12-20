const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const customerSchema = new mongoose.Schema({
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
});

customerSchema.methods.genereateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
    return token;
}
const Customer = mongoose.model('Customer', customerSchema);
async function createCustomer(email, phonenumber, password) {
    const customer = new Customer({
        email: email,
        phonenumber: phonenumber,
        password: password
    });
    await customer.save();
    return customer;
}
async function getCustomerEmail(email) {
    return await Customer.findOne({ email: email });
}
async function getById(id) {
    return await Customer.findById(id);
}
async function updatePassword(id, password) {
    await Customer.updateOne({ _id: id }, {
        $set: {
            password: password
        }
    })
}
module.exports.createCustomer = createCustomer;
module.exports.getCustomerEmail = getCustomerEmail;
module.exports.getById = getById;
module.exports.updatePassword = updatePassword;