const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
    packages: {
        type: Number,
        required: true
    },
    transactions: {
        type: Number,
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    }
});
const Stat = mongoose.model('Stats', statSchema);

async function createStat(account) {
    const stat = new Stat({
        packages: 0,
        transactions: 0,
        account: account
    });
    await stat.save();
    return stat;
}
async function incPackages(account) {
    const stat = await Stat.findOne({ account: account });
    stat.packages += 1;
    await stat.save();
}
async function incTransactions(account) {
    const stat = await Stat.findOne({ account: account });
    stat.transactions += 1;
    await stat.save();
}
async function getStat(account) {
    return await Stat.findOne({ account: account });
}
module.exports.createStat = createStat;
module.exports.incPackages = incPackages;
module.exports.incTransactions = incTransactions;
module.exports.getStat = getStat;