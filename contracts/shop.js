const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
var Eth = require('web3-eth');
var eth = new Eth(config.get('web3Connect'));
var Personal = require('web3-eth-personal');
var personal = new Personal(config.get('web3Connect'));
let abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint56","name":"_wme","type":"uint56"},{"internalType":"uint64","name":"_wshop","type":"uint64"}],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"payout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"wme","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wshop","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
let bytes = '0x6080604052731860486d0c738fdc9fd4ae3219f71d4ef4eac87d600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100665760006000fd5b505b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b6100af565b61066e806100be6000396000f3fe6080604052600436106100435760003560e01c8063278eacca146100495780632ce0e0cc1461008957806363bd1d4a146100d5578063f8f55eca146100ed57610043565b60006000fd5b3480156100565760006000fd5b5061005f61012d565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b6100d3600480360360408110156100a05760006000fd5b81019080803566ffffffffffffff169060200190929190803567ffffffffffffffff169060200190929190505050610147565b005b3480156100e25760006000fd5b506100eb6103ea565b005b3480156100fa5760006000fd5b506101036105fd565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b600160149054906101000a900467ffffffffffffffff1681565b34818366ffffffffffffff160167ffffffffffffffff16111515156101d7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f43616e742061737369676e206d6f7265207468616e206d73672e76616c75650081526020015060200191505060405180910390fd5b600160149054906101000a900467ffffffffffffffff1667ffffffffffffffff168266ffffffffffffff16600160149054906101000a900467ffffffffffffffff160167ffffffffffffffff1611151561029c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260088152602001807f4f766572666c6f7700000000000000000000000000000000000000000000000081526020015060200191505060405180910390fd5b600260009054906101000a900467ffffffffffffffff1667ffffffffffffffff1681600260009054906101000a900467ffffffffffffffff160167ffffffffffffffff16111515610358576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260088152602001807f4f766572666c6f7700000000000000000000000000000000000000000000000081526020015060200191505060405180910390fd5b8166ffffffffffffff16600160148282829054906101000a900467ffffffffffffffff160192506101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555080600260008282829054906101000a900467ffffffffffffffff160192506101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055505b5050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610492576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806106186021913960400191505060405180910390fd5b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600160149054906101000a900467ffffffffffffffff1667ffffffffffffffff169081150290604051600060405180830381858888f1935050505015801561051b573d600060003e3d6000fd5b50600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600260009054906101000a900467ffffffffffffffff1667ffffffffffffffff169081150290604051600060405180830381858888f193505050501580156105a5573d600060003e3d6000fd5b506000600160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055506000600260006101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055505b565b600260009054906101000a900467ffffffffffffffff168156fe4f6e6c79207468652073686f702063616e20706572666f726d207061796f757473a26469706673582212207fbf06f27175c7d01a4071e1b3b0f798f58037ab894b5532eb42cde8c03bbd5764736f6c63430006040033';
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
const payShopGas = (from, password, ashop, value, wme, wshop) => {
    return new Promise((resolve, reject) => {
        console.log('value', value);
        console.log('wme', wme);
        console.log('wshop', wshop);
        contract.options.address = ashop;
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if(unlock) {
                contract.methods.pay(web3.utils.toBN(wme), web3.utils.toBN(wshop)).estimateGas({
                    from: from,
                    value: web3.utils.toBN(value)
                }).then(resolve).catch(reject)
            } else throw new Error('Could not unlock account')
        })
    })
}
const payShop = (from, password, ashop, value, wme, wshop, gas, gasPrice) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        web3.eth.personal.unlockAccount(from, password, 1).then(unlock => {
            if (unlock) {
                web3.eth.sendTransaction({
                    from: from,
                    to: ashop,
                    gas: gas,
                    gasPrice: gasPrice,
                    data: contract.methods.pay(web3.utils.toBN(wme), web3.utils.toBN(wshop)).encodeABI(),
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
                    data: contract.methods.pay(web3.utils.toBN(wme), web3.utils.toBN(wshop)).encodeABI(),
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