const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    pack: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    account: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    sold: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
});
const Package = mongoose.model('Package', packageSchema);

async function createPackage(package, discount, price, account) {
    const pack = new Package({
        pack: package,
        discount: discount,
        price: price,
        account: account,
        sold: 0,
        isActive: true
    });
    await pack.save();
}
async function getPackages(account) {
    return await Package.find({ account: account });
}
async function getActivePackages(account) {
    return await Package.find({ account: account, isActive: true });
}
async function getPackage(id) {
    return await Package.findById(id);
}
async function incSold(id) {
    const package = await Package.findById(id);
    package.sold += 1;
    await package.save();
}
async function activate(account, id) {
    await Package.updateOne({ account: account, _id: id }, {
        $set: {
            isActive: true
        }
    })
}
async function deactivate(account, id) {
    await Package.updateOne({ account: account, _id: id }, {
        $set: {
            isActive: false
        }
    })
}
async function deschel(id) {
    await Package.deleteOne({ _id: id });
}
module.exports.createPackage = createPackage;
module.exports.getPackages = getPackages;
module.exports.getPackage = getPackage;
module.exports.incSold = incSold;
module.exports.activate = activate;
module.exports.deactivate = deactivate;
module.exports.getActivePackages = getActivePackages;
module.exports.deschel = deschel;