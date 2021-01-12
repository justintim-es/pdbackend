const mongoose = require('mongoose');

const phonenumberConfirmSchema = new mongoose.Schema({
    phonenumber: {
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
        required: true
    }
});
const PhonenumberConfirm = mongoose.model('PhonenumberConfirm', phonenumberConfirmSchema);
const PhonenumberCustomerConfirm = mongoose.model('PhonenumberCustomerConfirm', phonenumberConfirmSchema);
const PhonenumberSellerConfirm = mongoose.model('PhonenumberSellerConfirm', phonenumberConfirmSchema);
async function createPhonenumberConfirm(phonenumber, code) {
    const pn = await PhonenumberConfirm.findOne({ phonenumber: phonenumber });
    if(pn != null) throw new Error('Telefoonnummer is al bezet of u kunt het over 20 minuten opnieuw proberen');
    const phonenumberConfirm = new PhonenumberConfirm({
        phonenumber: phonenumber,
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await phonenumberConfirm.save();
}
async function createPhonenumberCustomerConfirm(phonenumber, code) {
    const pcc = await PhonenumberCustomerConfirm.findOne({ phonenumber: phonenumber });
    if(pcc != null) throw new Error('Telefoonnummer is al bezet of u kunt het over 20 minuten opnieuw proberen');
    const phonenumberCustomerConfirm = new PhonenumberCustomerConfirm({
        phonenumber: phonenumber,
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await phonenumberCustomerConfirm.save();
}
async function createPhonenumberSellerConfirm(phonenumber, code) {
    const psc = await PhonenumberSellerConfirm.findOne({ phonenumber: phonenumber });
    console.log(psc);
    if(psc != null) throw new Error('Telefoonnummer is al bezet of u kunt het over 20 minuten opnieuw proberen');
    const phonenumberSellerConfirm = new PhonenumberSellerConfirm({
        phonenumber: phonenumber,
        code: code,
        isConfirmed: false,
        removeDate: new Date(new Date().getTime() + 20*60000)
    });
    await phonenumberSellerConfirm.save();
}
async function confirmPhonenumber(phonenumber, code) {
    const phonenumberConfirm = await PhonenumberConfirm.findOne({ phonenumber: phonenumber, code: code });
    if(phonenumberConfirm == null) throw new Error('Ongeldig telefoonnummer en/of code');
    await PhonenumberConfirm.updateOne({ phonenumber: phonenumber, code: code }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function confirmCustomerPhonenumber(phonenumber, code) {
    const phonenumberCustomerConfirm = await PhonenumberCustomerConfirm.findOne({ phonenumber: phonenumber, code: code });
    if(phonenumberCustomerConfirm == null) throw new Error('Ongeldig telefoonnummer en/of code');
    await PhonenumberCustomerConfirm.updateOne({ phonenumber: phonenumber, code: code }, {
        $set: {
            isConfirmed: true
        }
    });
}
async function confirmSellerPhonenumber(phonenumber, code) {
    const phonenumberSellerConfirm = await PhonenumberSellerConfirm.findOne({ phonenumber: phonenumber, code: code });
    if(phonenumberSellerConfirm == null) throw new Error('Ongeldig telefoonnummer en/of code');
    await PhonenumberSellerConfirm.updateOne({ phonenumber: phonenumber, code: code }, {
        $set: {
            isConfirmed: true
        }
    })
}
async function deleteOutDated() {
    const phonenumberConfirms = await PhonenumberConfirm.find();
    for(var i = 0; i < phonenumberConfirms.length; i++) {
        if(new Date(phonenumberConfirms[i].removeDate) < new Date() && !phonenumberConfirms[i].isConfirmed) {
            await PhonenumberConfirm.deleteOne({ _id: phonenumberConfirms[i]._id });
        }
    }
}
async function deleteOutDatedCustomer() {
    const phonenumberCustomerConfirms = await PhonenumberCustomerConfirm.find();
    for(var i = 0; i < phonenumberCustomerConfirms.length; i++) {
        if(new Date(phonenumberCustomerConfirms[i].removeDate) < new Date() && !phonenumberCustomerConfirms[i].isConfirmed) {
            await PhonenumberConfirm.deleteOne({ _id: phonenumberCustomerConfirms[i]._id });
        }
    }
}
async function deleteOutdatedSeller() {
    const phonenumberSellerConfirms = await PhonenumberSellerConfirm.find();
    for (var i = 0; i < phonenumberSellerConfirms.length; i ++) {
        if (new Date(phonenumberSellerConfirms[i].removeDate < new Date() && !phonenumberSellerConfirms[i].isConfirmed)) {
            await PhonenumberSellerConfirm.deleteOne({ _id: phonenumberSellerConfirms[i]._id });
        }
    }
}
async function getCustomerConfirm(phonenumber) {
    return await PhonenumberCustomerConfirm.findOne({ phonenumber: phonenumber });
}
async function getSellerPhonenumberConfirm(phonenumber) {
    return await PhonenumberSellerConfirm.findOne({ phonenumber: phonenumber });
}

module.exports.createPhonenumberConfirm = createPhonenumberConfirm;
module.exports.createPhonenumberCustomerConfirm = createPhonenumberCustomerConfirm;
module.exports.createPhonenumberSellerConfirm = createPhonenumberSellerConfirm;
module.exports.confirmPhonenumber = confirmPhonenumber;
module.exports.confirmCustomerPhonenumber = confirmCustomerPhonenumber;
module.exports.confirmSellerPhonenumber = confirmSellerPhonenumber;
module.exports.deleteOutDated = deleteOutDated;
module.exports.deleteOutDatedCustomer = deleteOutDatedCustomer;
module.exports.deleteOutdatedSeller = deleteOutdatedSeller;
module.exports.getCustomerConfirm = getCustomerConfirm;
module.exports.getSellerPhonenumberConfirm = getSellerPhonenumberConfirm;