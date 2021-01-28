const abi = [{"inputs":[{"internalType":"address payable","name":"_seller","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint56","name":"_wme","type":"uint56"},{"internalType":"uint56","name":"_wseller","type":"uint56"},{"internalType":"uint64","name":"_wshop","type":"uint64"}],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"payout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"wme","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wseller","outputs":[{"internalType":"uint56","name":"","type":"uint56"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wshop","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
const bytes = '0x6080604052731860486d0c738fdc9fd4ae3219f71d4ef4eac87d600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100665760006000fd5b506040516107913803806107918339818101604052602081101561008a5760006000fd5b81019080805190602001909291905050505b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b50610125565b61065d806101346000396000f3fe60806040526004361061004e5760003560e01c806323fa94a014610054578063278eacca146100b357806363590bfe146100f357806363bd1d4a14610131578063f8f55eca146101495761004e565b60006000fd5b6100b16004803603606081101561006b5760006000fd5b81019080803566ffffffffffffff169060200190929190803566ffffffffffffff169060200190929190803567ffffffffffffffff169060200190929190505050610189565b005b3480156100c05760006000fd5b506100c96102f6565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b3480156101005760006000fd5b50610109610310565b604051808266ffffffffffffff1666ffffffffffffff16815260200191505060405180910390f35b34801561013e5760006000fd5b50610147610329565b005b3480156101565760006000fd5b5061015f6105ec565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b348266ffffffffffffff16828566ffffffffffffff16010167ffffffffffffffff1611151515610224576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f43616e742061737369676e206d6f7265207468616e206d73672e76616c75650081526020015060200191505060405180910390fd5b8266ffffffffffffff16600260148282829054906101000a900467ffffffffffffffff160192506101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555080600360008282829054906101000a900467ffffffffffffffff160192506101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555081600360088282829054906101000a900466ffffffffffffff160192506101000a81548166ffffffffffffff021916908366ffffffffffffff1602179055505b505050565b600260149054906101000a900467ffffffffffffffff1681565b600360089054906101000a900466ffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156103d1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806106076021913960400191505060405180910390fd5b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600260149054906101000a900467ffffffffffffffff1667ffffffffffffffff169081150290604051600060405180830381858888f1935050505015801561045a573d600060003e3d6000fd5b50600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600360009054906101000a900467ffffffffffffffff1667ffffffffffffffff169081150290604051600060405180830381858888f193505050501580156104e4573d600060003e3d6000fd5b50600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600360089054906101000a900466ffffffffffffff1666ffffffffffffff169081150290604051600060405180830381858888f1935050505015801561056c573d600060003e3d6000fd5b506000600260146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055506000600360006101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055506000600360086101000a81548166ffffffffffffff021916908366ffffffffffffff1602179055505b565b600360009054906101000a900467ffffffffffffffff168156fe4f6e6c79207468652073686f702063616e20706572666f726d207061796f757473a26469706673582212208daa0f1a30b499b04a50f0bb7e84f5ad725e2049d4db14df6abad3a5032e90bd64736f6c63430006040033';
const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
var Eth = require('web3-eth');
var eth = new Eth(config.get('web3Connect'));
var Personal = require('web3-eth-personal');
var personal = new Personal(config.get('web3Connect'));
let contract = new web3.eth.Contract(abi);
const deployShopSellerGas = (from, password, seller) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.deploy({
                    data: bytes,
                    arguments: [seller]
                }).estimateGas({
                    from: from
                }).then(resolve).catch(reject)
            } else throw new Error('Could not unlock account');
        }).catch(err => {
            throw new Error(err);
        })
    })
}
const deployShopSeller = (from, password, seller, gas, gasPrice) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.deploy({ 
                    data: bytes, 
                    arguments: [seller] 
                }).send({
                    from: from,
                    gas: gas,
                    gasPrice: gasPrice
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            } else throw new Error('Could not unlock account');
        }).catch(err => {
            throw new Error(err.message);
        })
    })
}
const redeployShopSeller = (from, password, seller, gas, gasPrice, nonce) => {
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.deploy({
                    data: bytes,
                    arguments: [seller]
                }).send({
                    from: from,
                    gas: gas,
                    gasPrice: gasPrice,
                    nonce: nonce
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err.message);
                })
            } else throw new Error('Could not unlock account');
        }).catch(err => {
            throw new Error(err.message);
        })
    })
}
const wmeShopSeller = (ashop, from) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        contract.methods.wme().call({
            from: from
        }).then(resolve).catch(reject)
    })
}
const wshopShopSeller = (ashop, from) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        contract.methods.wshop().call({
            from: from
        }).then(resolve).catch(reject)
    })
}
const wsellerShopSeller = (ashop, from) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        contract.methods.wseller().call({
            from: from
        }).then(resolve).catch(reject)
    })
}
const payShopSellerGas = (ashop, from, password, wme, wseller, wshop, value) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.methods.pay(web3.utils.toBN(wme), web3.utils.toBN(wseller), web3.utils.toBN(wshop)).estimateGas({
                    from: from,
                    value: web3.utils.toBN(value)
                }).then(resolve).catch(err => {
                    throw new Error(err.message);
                })
            } else throw new Error('Could not unlock account')
        })
    })
}
const payShopSeller = (ashop, from, password, wme, wseller, wshop, value, gas, gasPrice) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    data: contract.methods.pay(web3.utils.toBN(wme), web3.utils.toBN(wseller), web3.utils.toBN(wshop)).encodeABI(),
                    value: web3.utils.toBN(value),
                    gas: gas,
                    gasPrice: gasPrice
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err);
                })
            } else throw new Error('could not unlock account')
        })
    })
}
const repayShopSeller = (ashop, from, password, wme, wseller, wshop, value, gas, gasPrice, nonce) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    data: contract.methods.pay(web3.utils.toBN(wme), web3.utils.toBN(wseller), web3.utils.toBN(wshop)).encodeABI(),
                    value: web3.utils.toBN(value),
                    gas: gas,
                    gasPrice: gasPrice,
                    nonce: nonce
                }).on('transactionHash', resolve).catch(err => {
                    throw new Error(err.message);
                })
            } else throw new Error('could not unlock account')
        })
    })
}
const payoutShopSellerGas = (ashop, from, password) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                contract.methods.payout().estimateGas({
                    from: from
                }).then(resolve).catch(err => {
                    throw new Error(err);
                })
            }
        })
    })
}
const payoutShopSeller = (ashop, from, password, gas, gasPrice) => {
    contract.options.address = ashop;
    return new Promise((resolve, rejecet) => {
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
            }
        })
    })
}
const repayoutShopSeller = (ashop, from, password, gas, gasPrice, nonce) => {
    contract.options.address = ashop;
    return new Promise((resolve, rejecet) => {
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
            }
        })
    })
}
module.exports.deployShopSellerGas = deployShopSellerGas;
module.exports.deployShopSeller = deployShopSeller;
module.exports.redeployShopSeller = redeployShopSeller;
module.exports.wmeShopSeller = wmeShopSeller;
module.exports.wshopShopSeller = wshopShopSeller;
module.exports.wsellerShopSeller = wsellerShopSeller;
module.exports.payShopSellerGas = payShopSellerGas;
module.exports.payShopSeller = payShopSeller;
module.exports.repayShopSeller = repayShopSeller;
module.exports.payoutShopSellerGas = payoutShopSellerGas;
module.exports.payoutShopSeller = payoutShopSeller;
module.exports.repayoutShopSeller = repayoutShopSeller;