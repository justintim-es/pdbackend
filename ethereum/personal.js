const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
var Eth = require('web3-eth');
var eth = new Eth(config.get('web3Connect'));
var Personal = require('web3-eth-personal');
var personal = new Personal(config.get('web3Connect'));
const createPersonal = (password) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.newAccount(password).then(resolve).catch(reject)
    })
}
const sendTransaction = (address, password, wei, reciever) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(address, password, 1).then(unlock => {
            if(unlock) {
                web3.eth.sendTransaction({
                    value: wei,
                    from: address,
                    to: reciever,
                    gas: 21000
                }).on('transactionHash', resolve).catch(reject)
            }
            else reject({ message: 'Unable to unlock account' });
        }).catch(reject)
    })
}
module.exports.createPersonal = createPersonal;
module.exports.sendTransaction = sendTransaction;