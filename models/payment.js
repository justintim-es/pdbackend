const mongoose = require('mongoose');
const _ = require('lodash');
const paymentSchema = new mongoose.Schema({
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
    isFinalized: {
        type: Boolean,
        required: true,
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});
const Payment = mongoose.model('Payment', paymentSchema);

async function createPayment(paymentId, random, package, customer) {
    const payment = new Payment({
        paymentId: paymentId,
        random: random,
        isFinalized: false,
        package: package,
        customer: customer,
        date: new Date()
    });
    await payment.save();
}
async function getPayment(random) {
    return await Payment.findOne({ random: random });
}
async function finalizePayment(code) {
    await Payment.updateOne({ random: code }, {
        $set: {
            isFinalized: true
        }
    });
}
async function getPayments(package) {
    return await Payment.find({ package: package });
}
module.exports.createPayment = createPayment;
module.exports.getPayment = getPayment;
module.exports.finalizePayment = finalizePayment;
module.exports.getPayments = getPayments;