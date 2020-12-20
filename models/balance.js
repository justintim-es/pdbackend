const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    balance: {
        type: Number,
        required: true
    },
    subdomain: {
        type: String,
        required: true
    },
    package: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    customer: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});
const Balance = mongoose.model('Balance', balanceSchema);

async function createBalance(balance, subdomain, package, customer) {
    const baschal = await Balance.findOne({ package: package, customer: customer });
    if(baschal == null) {
        const bal = new Balance({
            balance: balance,
            subdomain: subdomain,
            package: package,
            customer: customer
        });
        await bal.save();
        return bal
    } else if((baschal.balance + balance) > baschal.balance) {
        baschal.balance += balance;
        await baschal.save();
        return baschal;
    } else throw new Error('Het saldo kan niet verder omhoog');
}
async function getBalance(customer, package) {
    return await Balance.findOne({ customer: customer, package: package });
}
async function getBalances(customer, subdomain) {
    return await Balance.find({ customer: customer, subdomain: subdomain });
}
async function payBalance(customer, subdomain, package, amount) {
    const balance = await Balance.findOne({ customer: customer, subdomain: subdomain, package: package });
    if(balance.balance >= amount) {
        balance.balance -= amount;
        await balance.save();
        return balance;
    } else throw new Error('Onvoldoende saldo € ' + balance.balance)
}
async function subdomainBalances(subdomain) {
    return await Balance.find({ subdomain: subdomain });
}
async function getCustomerBalances(customer) {
    return await Balance.find({ customer: customer });
}
async function getBalanceById(id) {
    return await Balance.findById(id);
}
async function getPackageBalance(package) {
    const packages = await Balance.find({ package: package });
    let packageBalance = 0;
    for(let i = 0; i < packages.length; i++) {
        packageBalance += packages[i].balance
    }
    return packageBalance;
}
module.exports.createBalance = createBalance;
module.exports.getBalance = getBalance;
module.exports.getBalances = getBalances;
module.exports.payBalance = payBalance;
module.exports.subdomainBalances = subdomainBalances;
module.exports.getCustomerBalances = getCustomerBalances;
module.exports.getBalanceById = getBalanceById;
module.exports.getPackageBalance = getPackageBalance;