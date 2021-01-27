var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');
var Eth = require('web3-eth');
var eth = new Eth('http://localhost:8545');
var Personal = require('web3-eth-personal');
const { txGas, address } = require('../ethereum/constants');
var personal = new Personal('http://localhost:8545');
const abi = [{"inputs":[{"internalType":"uint256","name":"wme","type":"uint256"},{"internalType":"uint256","name":"wshop","type":"uint256"},{"internalType":"address payable","name":"ashop","type":"address"}],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wme","type":"uint256"},{"internalType":"uint256","name":"wshop","type":"uint256"},{"internalType":"uint256","name":"wseller","type":"uint256"},{"internalType":"address payable","name":"aseller","type":"address"},{"internalType":"address payable","name":"ashop","type":"address"}],"name":"paySeller","outputs":[],"stateMutability":"payable","type":"function"}];
const bytes = '0x608060405273e4165c74c115aa1cbb9db1c2243307239a27076e600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100665760006000fd5b5061006c565b6102ff8061007b6000396000f3fe60806040526004361061002d5760003560e01c80630ad6ac851461003357806355be30d71461008c5761002d565b60006000fd5b61008a6004803603606081101561004a5760006000fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061010f565b005b61010d600480360360a08110156100a35760006000fd5b81019080803590602001909291908035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506101c7565b005b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc849081150290604051600060405180830381858888f19350505050158015610178573d600060003e3d6000fd5b508073ffffffffffffffffffffffffffffffffffffffff166108fc839081150290604051600060405180830381858888f193505050501580156101c0573d600060003e3d6000fd5b505b505050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc869081150290604051600060405180830381858888f19350505050158015610230573d600060003e3d6000fd5b508073ffffffffffffffffffffffffffffffffffffffff166108fc859081150290604051600060405180830381858888f19350505050158015610278573d600060003e3d6000fd5b508173ffffffffffffffffffffffffffffffffffffffff166108fc849081150290604051600060405180830381858888f193505050501580156102c0573d600060003e3d6000fd5b505b505050505056fea2646970667358221220b48452562d9a0e60a593bc2ab64ae4c705d3eba5acaaf75cb4566148eb4641ee64736f6c63430006040033';
const contractAddres = '0xf7C301d0bc08AA86A7Bfa878121353050b5A53EE';
let contract = new web3.eth.Contract(abi, contractAddres);
const paySellerGas = (wme, wshop, wseller, ame, aseller, ashop, from, value)    => {
    return new Promise((resolve, reject) => {
        contract.methods.paySeller(wme, wshop, wseller, ame, aseller, ashop).estimateGas({
            from: from,
            value: value
        }).then(resolve).catch(err => {
            throw new Error(err);
        })
    })
}
const paySeller = (wme, wshop, wseller, ame, aseller, ashop, from, value, gp) => {
    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({
            from: from,
            to: contractAddres,
            value: value,
            data: contract.methods.pay(wme, wshop, wseller, ame, aseller, ashop).encodeABI(),
            gas: gas,
            gp: gp
        }).on('transactionHash', resolve).catch(err => {
            throw new Error(err);
        });
    })
}
const payGas = (wme, wshop, ashop, from, value) => {
    return new Promise((resolve, reject) => {
        contract.methods.pay(wme, wshop, ashop).estimateGas({
            from: from,
            value: web3.utils.toHex(value)
        }).then(resolve).catch(err => {
            console.log(err);
            throw new Error(err);
        });
    })
}
const pay = (wme, wshop, ashop, from, value, gas, gp) => {
    console.log(from);
    console.log(value);
    console.log(gas);
    console.log(gp);
    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({
                from: from,
                to: contractAddres,
                value: web3.utils.toHex(value),
                data: contract.methods.pay(wme, wshop, ashop).encodeABI(),
                gas: web3.utils.toHex(gas),
                gasPrice: web3.utils.toHex(gp)
        }).on('transactionHash', resolve).catch(err => {
            throw new Error(err);
        });        
    })
}   	                                
module.exports.paySellerGas = paySellerGas;
module.exports.paySeller = paySeller;
module.exports.payGas = payGas;
module.exports.pay = pay;