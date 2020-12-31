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
const EmailSellerConfirm = mongoose.model('EmailSellerConfirm', emailConfirmSchema);
async function createEmailConfirm(email, code) {
    const ec = await EmailConfirm.findOne({ email: email });
    if(ec != null) throw new Error("E-Mail voor deze winkel is al bezet");
    const emailConfirm = new EmailConfirm({
        email: email.toLowerCase(),
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000),
    });
    await emailConfirm.save();
}
async function createEmailCustomerConfirm(email, code) {
    const ecc = await EmailCustomerConfirm.findOne({ email: email });
    if(ecc != null) throw new Error("Email voor deze klant is al bezet");
    const emailCustomerConfirm = new EmailCustomerConfirm({
        email: email.toLowerCase(),
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await emailCustomerConfirm.save();
}
async function createEmailSellerConfirm(email, code) {
    const esc = await EmailSellerConfirm.findOne({ email: email });
    if(esc != null) throw new Error('Email voor deze klant is al bezet');
    const emailSellerConfirm = new EmailSellerConfirm({
        email: email,
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await emailSellerConfirm.save();
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
async function confirmEmailSellerConfirm(code) {
    const emailSellerConfirm = await EmailSellerConfirm.findOne({ code: code });
    if(emailSellerConfirm == null) throw new Error('Ongeldige code');
    await EmailSellerConfirm.updateOne({ code: code }, {
        $set: {
            isConfirmed: true
        }
    })
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
async function deleteOutdatedSeller() {
    const emailSellerConfirms = await EmailSellerConfirm.find();
    for(var i = 0; i < emailSellerConfirms.length; i++) {
        if (new Date(emailSellerConfirms[i].removeDate < new Date() && !emailSellerConfirms[i].isConfirmed)) {
            await EmailSellerConfirm.deleteOne({ _id: emailSellerConfirms[i]._id });
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
module.exports.createEmailSellerConfirm = createEmailSellerConfirm;
module.exports.confirmEmailConfirm = confirmEmailConfirm;
module.exports.confirmEmailCustomerConfirm = confirmEmailCustomerConfirm;
module.exports.confirmEmailSellerConfirm = confirmEmailSellerConfirm;
module.exports.deleteOutdated = deleteOutdated;
module.exports.deleteOutdatedCustomer = deleteOutdatedCustomer;
module.exports.deleteOutdatedSeller = deleteOutdatedSeller;
module.exports.getEmailFromCode = getEmailFromCode; 
module.exports.getCustomerEmailFromCode = getCustomerEmailFromCode;