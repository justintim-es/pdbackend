const mongoose = require('mongoose');

const paymentBalanceBridgeSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    balance: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});
const PaymentBalanceBridge = mongoose.model('PaymentBalanceBridge', paymentBalanceBridgeSchema);

async function createPaymentBalanceBridge(payment, balance) {
    const paymentBalanceBridge = new PaymentBalanceBridge({
        payment: payment,
        balance: balance
    });
    await paymentBalanceBridge.save();
}
async function getPaymentBalanceBridge(payment) {
    return await PaymentBalanceBridge.findOne({ payment: payment });
}
module.exports.createPaymentBalanceBridge = createPaymentBalanceBridge;
module.exports.getPaymentBalanceBridge = getPaymentBalanceBridge;