const config = require('config');
var Web3 = require('web3');
var web3 = new Web3('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
// var web3 = new Web3('http://localhost:8545');
var Eth = require('web3-eth');
// var eth = new Eth('http://localhost:8545');
var eth = new Eth('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
var Personal = require('web3-eth-personal');
var personal = new Personal('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
// var personal = new Personal('http://localhost:8545');
const { address, txGas } = require('../ethereum/constants');
// var Personal = require('web3-eth-personal');
// var personal = new Personal('http://localhost:8888');
// web3.eth.getBalance('0x46dbc88e056eb5c2d859789d98e8ec2948e7f3d5').then(console.log);
// web3.eth.getGasPrice().then(gp => {
//     console.log(gp * 21000, 'gp');
//     console.log(3735834151973344 + gp * 21000);
// const eschet = 0.5 / 1000;
// const wei = web3.utils.toWei(eschet.toString());
// console.log(wei / 21000);
// web3.eth.personal.unlockAccount('0x50aD80c90a9A0b51dC791Ea49dFA9Ce1b28c7b06', '034af3812eabb8f621ddd97648a8915e3ec0f7e41538415e47ddfef760911873e0e65a5b26a9b2745f3f7edbfb94ec774583db858a6b89699eaa3ababee06333bbe623adec8136c8ec8db57f01bc51e9eff1a07aa39e617f5e0488e1c60cf69eb15c96b29c0153f9229eb71d0b7c921069adc2b883a2b4caef8e26e666ef43d9', 1).then(unlock => {
//     if(unlock) {
//         web3.eth.sendTransaction({
//             from: '0x50aD80c90a9A0b51dC791Ea49dFA9Ce1b28c7b06',
//             to: '0x46dbc88e056eb5c2d859789d98e8ec2948e7f3d5',
//             value: web3.utils.toHex(819187398233544),
//             gas: web3.utils.toHex(21000),
//             gasPrice: web3.utils.toHex(53294960961),
//         }).on('transactionHash', hash => console.log(hash));
//     }
// })
// web3.eth.getBalance('0x50aD80c90a9A0b51dC791Ea49dFA9Ce1b28c7b06').then(baschal => {
//     console.log(baschal - 21000 * 53294960961)
// })
// web3.eth.getBalance('0x4dD645A3AD216c3cA14D8537Ca995BA138Af0A4b').then(console.log)
// console.log(5417596222549610 - (21000 * 53294960961))
// // })
// web3.eth.getGasPrice().then(gp => {
//     console.log(gp);
//     const fee = gp * 21000;
//     console.log(fee);
// })
// console.log(110000000000 / 100)
// web3.eth.getTransaction('0x359d6b2afa691985f4059fb9f58b446f5a41313421735216d719014dbaf950ef').then(console.log)
// web3.eth.getBalance('0x78c711552a3d4bDF534268cE53DE6EDA4b9C5e20').then(console.log);
// web3.eth.getTransaction('0xcfec60c85bfecc6287d3ac996b488a52daf68098c62b949ccbdb5f1f45f0e487').then(console.log);
// web3.eth.getBalance('0xD3f449Af196952D889e61794e1E9c03C522c9758').then(console.log)
// web3.eth.getTransaction('0x5e514d88fdc0dfb479fd0fc4a4e86b120fb17200b4cab9814a7b5c23c10b9542').then(console.log);
// web3.eth.personal.newAccount('BloschockChaschain32!').then(console.log);
// web3.eth.getAccounts().then(console.log);
// web3.eth.getGasPrice().then(console.log);
// web3.eth.getAccounts().then(console.log);
// web3.eth.getGasPrice().then(console.log);
// const eschet = web3.utils.fromWei((9000000000 * 21000).toString());
// console.log(821.79 * eschet);
web3.eth.personal.unlockAccount('0x4dD645A3AD216c3cA14D8537Ca995BA138Af0A4b', 'BloschockChaschain32!').then(console.log)
// const eschet =  4.5 / 893.50;
// const wei = web3.utils.toWei(eschet.toString().substring(0, 20));
// console.log(wei);