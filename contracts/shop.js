// const config = require('config');
var Web3 = require('web3');
// var web3 = new Web3(config.get('web3Connect'));
var web3 = new Web3('http://localhost:8545');
var Eth = require('web3-eth');
// var eth = new Eth(config.get('web3Connect'));
var eth = new Eth('http://localhost:8545');
var Personal = require('web3-eth-personal');
// var personal = new Personal(config.get('web3Connect'));
var personal = new Personal('http://localhost:8545');
let abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint8","name":"_wme","type":"uint8"}],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"payout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"wme","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"}];
let bytes = '0x6080604052731860486d0c738fdc9fd4ae3219f71d4ef4eac87d600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100665760006000fd5b505b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b6100af565b6103e2806100be6000396000f3fe6080604052600436106100385760003560e01c8063278eacca1461003e57806363bd1d4a14610072578063f0c9325e1461008a57610038565b60006000fd5b34801561004b5760006000fd5b506100546100bc565b604051808261ffff1661ffff16815260200191505060405180910390f35b34801561007f5760006000fd5b506100886100d0565b005b6100ba600480360360208110156100a15760006000fd5b81019080803560ff1690602001909291905050506102ad565b005b600160149054906101000a900461ffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610178576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602181526020018061038c6021913960400191505060405180910390fd5b6000655af3107a4000600160149054906101000a900461ffff1661ffff160265ffffffffffff169050600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc8267ffffffffffffffff169081150290604051600060405180830381858888f19350505050158015610214573d600060003e3d6000fd5b50600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc8267ffffffffffffffff1647039081150290604051600060405180830381858888f1935050505015801561028a573d600060003e3d6000fd5b506000600160146101000a81548161ffff021916908361ffff160217905550505b565b600160149054906101000a900461ffff1661ffff168160ff16600160149054906101000a900461ffff160161ffff16111515610354576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260088152602001807f4f766572666c6f7700000000000000000000000000000000000000000000000081526020015060200191505060405180910390fd5b8060ff16600160148282829054906101000a900461ffff160192506101000a81548161ffff021916908361ffff1602179055505b5056fe4f6e6c79207468652073686f702063616e20706572666f726d207061796f757473a264697066735822122021eab1c09fef6e44db5566a7be01267f25e4b8283825398b1209141cf110f78264736f6c63430006040033';
let contract = new web3.eth.Contract(abi);
const deployShopGas = (ashop, password) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(ashop, password, 1).then(unlock => {
            if(unlock) {
                contract.deploy({
                    data: bytes
                }).estimateGas({
                    from: ashop,
                }).then(resolve).catch(reject)
            } else throw new Error('Could not unlock account')
        }).catch(err => {
            throw new Error(err);
        })
    })
}
// deployShopGas('0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 'Floris12!').then(console.log);
// console.log(web3.utils.fromWei((362605 * 47906486538).toString().substring(0, 20)) * 1040);
                                   
// web3.eth.getGasPrice().then(console.log);
const deployShop = (ashop, password, gas, gasPrice) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(ashop, password, 1).then(unlock => {
            if(unlock) {
                web3.eth.sendTransaction({
                    data: bytes,
                    from: ashop,
                    gas: gas,
                    gasPrice: gasPrice
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })  
            } else throw new Error('Could not unlock account');
        }).catch(err => {
            throw new Error(err);
        })
    })
}
// deployShop('0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 'Floris12!', 363952, 47906486538).then(console.log);
// console.log(web3.utils.fromWei((27945 * 43906486538).toString().substring(0, 20)) * 1338);
// web3.eth.getTransactionReceipt('0x59a80dc8d9e880140a73971e640fbdb1438a63665223f298347c72237eb751ec').then(console.log);
const redeployShop = (ashop, password, gas, gasPrice, nonce) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(ashop, password, 1).then(unlock => {
            if(unlock) {
                contract.deploy({
                    data: bytes
                }).send({
                    from: ashop,
                    gas: web3.utils.toHex(gas),
                    gasPrice: web3.utils.toHex(gasPrice),
                    nonce: web3.utils.toHex(nonce)
                 }).on('transactionHash', resolve).catch(reject)
            } else throw new Error('Could not unlock account');
        }).catch(err => {
            throw new Error(err);
        })
    })
}
const wmeShop = (ashop, from) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        contract.methods.wme().call({
            from: from
        }).then(resolve).catch(reject)
    })
}
const wshopShop = (ashop, from) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        contract.methods.wshop().call({
            from: from
        }).then(resolve).catch(reject)
    })
}
const payShopGas = (from, password, ashop, value, wme) => {
    return new Promise((resolve, reject) => {
        console.log('value', value);
        console.log('wme', wme);
        contract.options.address = ashop;
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.methods.pay(web3.utils.toBN(wme)).estimateGas({
                    from: from,
                    value: web3.utils.toBN(value)
                }).then(resolve).catch(reject)
            } else throw new Error('Could not unlock account')
        })
    })
}
// payShopGas('0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 'Floris12!', '0x7a0A9eFeC1D036B72Dc5a72496f61C4ED82679a3', 1561301725788852, 3).then(console.log);
const payShop = (from, password, ashop, value, wme, gas, gasPrice) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    gas: gas,
                    gasPrice: gasPrice,
                    data: contract.methods.pay(web3.utils.toBN(wme)).encodeABI(),
                    value: web3.utils.toBN(value)
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            } else throw new Error('Could not unlock account')
        })
    })
}
const rePayShop = (from, password, ashop, value, wme, wshop, gas, gasPrice, nonce) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    gas: gas,
                    gasPrice: gasPrice,
                    data: contract.methods.pay(web3.utils.toBN(wme)).encodeABI(),
                    value: web3.utils.toBN(value),
                    nonce: nonce
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            } else throw new Error('Could not unlock account')
        })
    })
}
const payoutGas = (from, password, ashop) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.methods.payout().estimateGas({
                    from: from
                }).then(resolve).catch(reject)
            } else throw new Error('Could not unlock account')
        })
    })
}
const payout = (from, password, ashop, gas, gasPrice) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    data: contract.methods.payout().encodeABI(),
                    gas: gas,
                    gasPrice: gasPrice
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            } else throw new Error('Could not unlock account')
        })
    })
}
const rePayout = (from, password, ashop, gas, gasPrice, nonce) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    data: contract.methods.payout().encodeABI(),
                    gas: gas,
                    gasPrice: gasPrice,
                    nonce: nonce
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            } else throw new Error('Could not unlock account')
        })
    })
}
module.exports.deployShopGas = deployShopGas;
module.exports.deployShop = deployShop;
module.exports.redeployShop = redeployShop;
module.exports.wmeShop = wmeShop;
module.exports.wshopShop = wshopShop;
module.exports.payShopGas = payShopGas;
module.exports.payShop = payShop;
module.exports.rePayShop = rePayShop;
module.exports.payout = payout;
module.exports.payoutGas = payoutGas;
module.exports.rePayout = rePayout;