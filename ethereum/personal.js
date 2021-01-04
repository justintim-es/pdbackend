const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
var Eth = require('web3-eth');
var eth = new Eth(config.get('web3Connect'));
var Personal = require('web3-eth-personal');
const { txGas } = require('./constants');
var personal = new Personal(config.get('web3Connect'));
const createPersonal = (password) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.newAccount(password).then(resolve).catch(reject)
    })
}
const sendTransaction = (address, password, wei, reciever, gp) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(address, password, 10).then(unlock => {
            console.log(unlock);
            if(unlock) {
                web3.eth.sendTransaction({
                    value: wei,
                    from: address,
                    to: reciever,
                    gas: txGas,
                    gasPrice: gp.toString()
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            }
            else throw new Error('Unable to unlock the account');
        }).catch(err => {
            throw new Error(err);
        })
    })
}
module.exports.createPersonal = createPersonal;
module.exports.sendTransaction = sendTransaction;