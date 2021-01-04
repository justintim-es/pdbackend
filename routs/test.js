const config = require('config');
var Web3 = require('web3');
var web3 = new Web3('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
// var web3 = new Web3('http://localhost:8545')
var Eth = require('web3-eth');
// var eth = new Eth('http://localhost:8545')
var eth = new Eth('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
// var Personal = require('web3-eth-personal');
// var personal = new Personal('http://localhost:8888');
// web3.eth.sendTransaction({
//     from: '0x476C3b90741bAaa176b57906d3dBDdE214fc621b',
//     to: '0x5ea1D1eE28a8AD65Cecc429127Fb6BC68C651d2a',
//     value: web3.utils.toWei('1')
// }).then(console.log);

// web3.eth.getBalance('0xD3f449Af196952D889e61794e1E9c03C522c9758').then(console.log)
// web3.eth.getTransaction('0x5e514d88fdc0dfb479fd0fc4a4e86b120fb17200b4cab9814a7b5c23c10b9542').then(console.log);
web3.eth.personal.newAccount('BloschockChaschain32!').then(console.log);
// web3.eth.getGasPrice().then(console.log);
// web3.eth.getAccounts().then(console.log);
// web3.eth.getGasPrice().then(console.log);
// const eschet = web3.utils.fromWei((9000000000 * 21000).toString());
// console.log(821.79 * eschet);
