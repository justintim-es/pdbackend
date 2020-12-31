var Web3 = require('web3');
var web3 = new Web3('http://188.166.2.131:8545')
var Eth = require('web3-eth');
var eth = new Eth('http://188.166.2.131:8545');

web3.eth.getAccounts().then(console.log)