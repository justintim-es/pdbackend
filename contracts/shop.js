var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');
var Eth = require('web3-eth');
var eth = new Eth('http://localhost:8545');
var Personal = require('web3-eth-personal');
var personal = new Personal('http://localhost:8545');
let abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint56","name":"_wme","type":"uint56"},{"internalType":"uint64","name":"_wshop","type":"uint64"}],"name":"pay","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"payout","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"wme","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wshop","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"}];
let bytes = '0x608060405273e4165c74c115aa1cbb9db1c2243307239a27076e600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100665760006000fd5b505b33600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b6100af565b61066e806100be6000396000f3fe6080604052600436106100435760003560e01c8063278eacca146100495780632ce0e0cc1461008957806363bd1d4a146100d5578063f8f55eca146100ed57610043565b60006000fd5b3480156100565760006000fd5b5061005f61012d565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b6100d3600480360360408110156100a05760006000fd5b81019080803566ffffffffffffff169060200190929190803567ffffffffffffffff169060200190929190505050610147565b005b3480156100e25760006000fd5b506100eb6103ea565b005b3480156100fa5760006000fd5b506101036105fd565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b600160149054906101000a900467ffffffffffffffff1681565b34818366ffffffffffffff160167ffffffffffffffff16111515156101d7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f43616e742061737369676e206d6f7265207468616e206d73672e76616c75650081526020015060200191505060405180910390fd5b600160149054906101000a900467ffffffffffffffff1667ffffffffffffffff168266ffffffffffffff16600160149054906101000a900467ffffffffffffffff160167ffffffffffffffff1611151561029c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260088152602001807f4f766572666c6f7700000000000000000000000000000000000000000000000081526020015060200191505060405180910390fd5b600260009054906101000a900467ffffffffffffffff1667ffffffffffffffff1681600260009054906101000a900467ffffffffffffffff160167ffffffffffffffff16111515610358576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260088152602001807f4f766572666c6f7700000000000000000000000000000000000000000000000081526020015060200191505060405180910390fd5b8166ffffffffffffff16600160148282829054906101000a900467ffffffffffffffff160192506101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555080600260008282829054906101000a900467ffffffffffffffff160192506101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055505b5050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610492576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806106186021913960400191505060405180910390fd5b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600160149054906101000a900467ffffffffffffffff1667ffffffffffffffff169081150290604051600060405180830381858888f1935050505015801561051b573d600060003e3d6000fd5b50600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc600260009054906101000a900467ffffffffffffffff1667ffffffffffffffff169081150290604051600060405180830381858888f193505050501580156105a5573d600060003e3d6000fd5b506000600160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055506000600260006101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055505b565b600260009054906101000a900467ffffffffffffffff168156fe4f6e6c79207468652073686f702063616e20706572666f726d207061796f757473a2646970667358221220442ef2ed2193bb469ca4574dd5c99219d3efaddecf888645c174cf4a7922e19264736f6c63430006040033';
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
// deployShopGas('0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 'Floris12!').then(console.log)
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
// deployShop('0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 'Floris12!', 510976, 47906486538).then(console.log);
// web3.eth.getTransactionReceipt('0xb9f427c3a554be7076437c8717d1466bca29dd43d3c1036cbe0dedba55d34f66').then(console.log);
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
// wmeShop('0x0f64CCe1517F89B55A7E6EAf62ae7A1aF98Ed69D', '0x3aC11d8a31B0C39C8fa86E1F379bE254174825F8').then(console.log);
const wshopShop = (ashop, from) => {
    contract.options.address = ashop;
    return new Promise((resolve, reject) => {
        contract.methods.wshop().call({
            from: from
        }).then(resolve).catch(reject)
    })
}
// wshopShop('0x0f64CCe1517F89B55A7E6EAf62ae7A1aF98Ed69D', '0x3aC11d8a31B0C39C8fa86E1F379bE254174825F8').then(console.log);
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
// payShopGas(
//     '0x4243839d1aafd7cd6391cadfcaa4c5304b83fcd2', 
//     'Floris12!',
//     '0xDE7C99030a3289dD5dE3674842556a5A933a37a1',
//     999135912439885300, 
//     998118209313525100, 
//     1017703126357268
// ).then(console.log);
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
// payoutGas('0x3aC11d8a31B0C39C8fa86E1F379bE254174825F8', '17d922f237b57901d14fd2f020cefca06af9417475c76c9cc5611f0eb5fba61c490920b089caed2235605790a3d934248ba102165181cff12f14a6ed79aa1b656d2ff7a39dfe28a81a2ad63074f29ac8dc23b868e835b54d2a3edea7d53cee0f93f548e4fa753b8be4059377f15cffd8e125e7381e67b18f8989b41626c6d35e', '0x0f64CCe1517F89B55A7E6EAf62ae7A1aF98Ed69D').then(console.log);
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