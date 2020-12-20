const mongooose = require('mongoose');

const receiptSchema = new mongooose.Schema({
    amount: {
        type: Number,
        required: true
    },
    customer: {
        type: mongooose.Schema.Types.ObjectId,
        required: true
    },
    package: {
        type: mongooose.Schema.Types.ObjectId,
        required: true
    },
    subdomain: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    newBalance: {
        type: Number,
        required: true
    }
})
const Receipt = mongooose.model('Receipt', receiptSchema);

async function createReceipt(amount, customer, package, subdomain, newBalance) {
    const receipt = new Receipt({
        amount: amount,
        customer: customer,
        package: package,
        subdomain: subdomain,
        date: new Date(),
        newBalance: newBalance
    });
    await receipt.save();
    return receipt;
}
async function getReceipts(customer) {
    return await Receipt.find({ customer: customer });
}
async function getPackageReceipts(customer, package) {
    return await Receipt.find({ customer: customer, package: package });
}
module.exports.createReceipt = createReceipt;
module.exports.getReceipts = getReceipts;
module.exports.getPackageReceipts = getPackageReceipts;