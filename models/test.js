const mongoose = require('mongoose');
const _ = require('lodash');
// undecentralized.transaction.one
const testSchema = new mongoose.Schema({
    paymentId: {
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
    }
});
const Test = mongoose.model('Test', testSchema);
async function createTest(paymentId, random, amount, package) {
    const test = new Test({
        paymentId: paymentId,
        random: random,
        amount: amount,
        package: package
    });
    await test.save();
}
async function getTest(random) {
    return await Test.findOne({ random: random });
}
module.exports.testSchema = testSchema;
module.exports.createTest = createTest;
module.exports.getTest = getTest;   