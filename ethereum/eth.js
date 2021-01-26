const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
var Eth = require('web3-eth');
var eth = new Eth(config.get('web3Connect'));

const balance = (address) => {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address).then(resolve).catch(err => {
            throw new Error(err);
        })
    })
}
const blockNumber = () => {
    return new Promise((resolve, reject) => {
        web3.eth.getBlockNumber().then(resolve).catch(err => {
            throw new Error(err);
        });
    })
}
const gasPrice = () => {
    return new Promise((resolve, reject) => {
        web3.eth.getGasPrice().then(resolve).catch(reject);
    })
}
const getTransaction = (hash) => {
    return new Promise((resolve, reject) => {
        web3.eth.getTransaction(hash).then(resolve).catch(reject)
    })
}
const getTransactionReceipt = (hash) => {
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(hash).then(resolve).catch(reject)
    })
}
module.exports.balance = balance;
module.exports.blockNumber = blockNumber;
module.exports.gasPrice = gasPrice;
module.exports.getTransaction = getTransaction;
module.exports.getTransactionReceipt = getTransactionReceipt;