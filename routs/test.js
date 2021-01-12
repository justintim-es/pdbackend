const config = require('config');
var Web3 = require('web3');
// var web3 = new Web3('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
var web3 = new Web3('http://localhost:8545');
var Eth = require('web3-eth');
var eth = new Eth('http://localhost:8545');
// var eth = new Eth('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
var Personal = require('web3-eth-personal');
// var personal = new Personal('http://noschoonesche:NaschachtSteschein32!@35.204.9.58');
var personal = new Personal('http://localhost:8545');
const { address } = require('../ethereum/constants');
// var Personal = require('web3-eth-personal');
// var personal = new Personal('http://localhost:8888');
// web3.eth.getBalance('0x46dbc88e056eb5c2d859789d98e8ec2948e7f3d5').then(console.log);
// web3.eth.getGasPrice().then(gp => {
//     console.log(gp * 21000, 'gp');
//     console.log(3735834151973344 + gp * 21000);
// const eschet = 0.5 / 1000;
// const wei = web3.utils.toWei(eschet.toString());
// console.log(wei / 21000);
web3.eth.personal.unlockAccount('0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 'Floris12!', 1).then(unlock => {
    if(unlock) {
        web3.eth.sendTransaction({
            from: '0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2',
            to: '0x781332e69301e0abdD2328d3f1DdAdA72F87A189',
            value: web3.utils.toWei('1'),
            gas: 21000
        }).on('transactionHash', hash => console.log(hash));
    }
})
// // })
// web3.eth.getGasPrice().then(gp => {
//     console.log(gp);
//     const fee = gp * 21000;
//     console.log(fee);
// })
// console.log(110000000000 / 100)
// web3.eth.getTransaction('0x359d6b2afa691985f4059fb9f58b446f5a41313421735216d719014dbaf950ef').then(console.log)
// web3.eth.getBalance('0x78c711552a3d4bDF534268cE53DE6EDA4b9C5e20').then(console.log);
web3.eth.getTransaction('0xcfec60c85bfecc6287d3ac996b488a52daf68098c62b949ccbdb5f1f45f0e487').then(console.log);
// web3.eth.getBalance('0xD3f449Af196952D889e61794e1E9c03C522c9758').then(console.log)
// web3.eth.getTransaction('0x5e514d88fdc0dfb479fd0fc4a4e86b120fb17200b4cab9814a7b5c23c10b9542').then(console.log);
// web3.eth.personal.newAccount('BloschockChaschain32!').then(console.log);
// web3.eth.getAccounts().then(console.log);
// web3.eth.getGasPrice().then(console.log);
// web3.eth.getAccounts().then(console.log);
// web3.eth.getGasPrice().then(console.log);
// const eschet = web3.utils.fromWei((9000000000 * 21000).toString());
// console.log(821.79 * eschet);
