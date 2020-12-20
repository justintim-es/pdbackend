const mongoose = require('mongoose');

const emailConfirmSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    isConfirmed: {
        type: Boolean,
        required: true,
    },
    removeDate: {
        type: Date,
        required: true,
    },
});
const EmailConfirm = mongoose.model('EmailConfirm', emailConfirmSchema);
const EmailCustomerConfirm = mongoose.model('EmailCustomerConfirm', emailConfirmSchema);
async function createEmailConfirm(email, code) {
    const emailConfirm = new EmailConfirm({
        email: email.toLowerCase(),
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000),
    });
    await emailConfirm.save();
}
async function createEmailCustomerConfirm(email, code) {
    const emailCustomerConfirm = new EmailCustomerConfirm({
        email: email.toLowerCase(),
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await emailCustomerConfirm.save();
}
async function confirmEmailConfirm(code) {
    const emailConfirm = await EmailConfirm.findOne({ code: code });
    if(emailConfirm == null) throw new Error('Ongeldige code');
    await EmailConfirm.updateOne({ code: code }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function confirmEmailCustomerConfirm(code) {
    const emailCustomerConfirm = await EmailCustomerConfirm.findOne({ code: code });
    if(emailCustomerConfirm == null) throw new Error('Ongeldige code');
    await EmailCustomerConfirm.updateOne({ code: code}, {
        $set: {
            isConfirmed: true
        }
    });
}
async function deleteOutdated() {
    const emailConfirms = await EmailConfirm.find();
    for (var i = 0; i < emailConfirms.length; i++) {
        if (new Date(emailConfirms[i].removeDate) < new Date() && !emailConfirms[i].isConfirmed) {
            await EmailConfirm.deleteOne({ _id: emailConfirms[i]._id });
        }
    }
}
async function deleteOutdatedCustomer() {
    const emailCustomerConfirms = await EmailCustomerConfirm.find();
    for (var i = 0; i < emailCustomerConfirms.length; i++) {
        if (new Date(emailCustomerConfirms[i].removeDate < new Date() && !emailCustomerConfirms[i].isConfirmed)) {
            await EmailCustomerConfirm.deleteOne({ _id: emailCustomerConfirms[i]._id });
        }
    }
}
async function getEmailFromCode(code) {
    const emailConfirm = await EmailConfirm.findOne({ code: code });
    return emailConfirm.email;
}
async function getCustomerEmailFromCode(code) {
    const emailConfirm = await EmailCustomerConfirm.findOne({ code: code });
    return emailConfirm.email;
}
module.exports.createEmailConfirm = createEmailConfirm;
module.exports.createEmailCustomerConfirm = createEmailCustomerConfirm;
module.exports.confirmEmailConfirm = confirmEmailConfirm;
module.exports.confirmEmailCustomerConfirm = confirmEmailCustomerConfirm;
module.exports.deleteOutdated = deleteOutdated;
module.exports.deleteOutdatedCustomer = deleteOutdatedCustomer;
module.exports.getEmailFromCode = getEmailFromCode; 
module.exports.getCustomerEmailFromCode = getCustomerEmailFromCode;