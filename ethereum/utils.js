const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
const { price } = require('./etherscan');
const { eur } = require('./exchangerates');
const toWei = (eth) => {
    return web3.utils.toWei(eth.toString());
}
const toEth = (wei) => {
    return web3.utils.fromWei(wei.toString());
}
const ethToEur = (eth) => {
    return new Promise((resolve, reject) => {
        price().then(prischic => {
            const dollar = prischic.data.result.ethusd * eth;
            eur().then(escheur => {
                resolve(escheur.data.rates.EUR * dollar);
            }).catch(reject)
        }).catch(reject)
    })
}

module.exports.toWei = toWei;
module.exports.toEth = toEth;
module.exports.ethToEur = ethToEur;