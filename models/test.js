const mongoose = require('mongoose');
const _ = require('lodash');
// undecentralized.transaction.one
const testSchema = new mongoose.Schema({
    paymentData: {
        type: String,
        required: true,
        unique: true
    },
    random: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    package: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true
    }
});
const Test = mongoose.model('Test', testSchema);
async function createTest(paymentData, random, amount, package, reference) {
    const test = new Test({
        paymentData : paymentData,
        random: random,
        amount: amount,
        package: package,
        reference: reference
    });
    await test.save();
}
async function getTest(random) {
    return await Test.findOne({ random: random });
}
module.exports.testSchema = testSchema;
module.exports.createTest = createTest;
module.exports.getTest = getTest;   