const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const asyncMiddle = require('../middleware/async');
const { balance, getTransaction, blockNumber } = require('../ethereum/eth');
const { findById } = require('../models/account');
const { getShopContractAddressAccount, updateShopContractAddressAccountServiceFee } = require('../models/shop-contract-address');
const { wshopShop, wmeShop, payout, payoutGas, payShopGas, rePayShop, rePayout } = require('../contracts/shop');
const { ethToEur, toEth, eurToEth, toWei } = require('../ethereum/utils');
const { price } = require('../ethereum/etherscan');
const { getEthereumPaymentsAccount, getEthereumPaymentHash, resendEthereumPayment } = require('../models/ethereum-payment');
const _ = require('lodash');
const { createPayout, getPayouts, resendPayout } = require('../models/payout');
const Joi = require('joi');
const { txFee, eurMeShop } = require('../ethereum/constants');
const { payShopSellerGas, repayShopSeller, wshopShopSeller, wmeShopSeller, wsellerShopSeller, payoutShopSellerGas, payoutShopSeller, repayoutShopSeller } = require('../contracts/shop-seller');
const { updateSellReceiptsPayoutHashContractAddress, updateSellReceiptsPayoutHashContractAddressPayoutHash } = require('../models/sell-receipt');
router.get('/balance', auth, asyncMiddle(async (req, res) => {
    const contractAddress = await getShopContractAddressAccount(req.user._id);
    const account = await findById(req.user._id);
    if(!account.isSells) {
        wshopShop(contractAddress.contractAddress).then(wshop => 
            ethToEur(toEth(wshop)).then(eshop => 
                wmeShop(contractAddress.contractAddress).then(wme => 
                    ethToEur(toEth(wme)).then(eme => res.send({
                        eurShop: eshop,
                        eurMe: eme,
                        ethShop: toEth(wshop),
                        ethMe: toEth(wme)
                    }))
                )
            )
        ); 
    } else {
        wshopShopSeller(contractAddress.contractAddress).then(wshop => 
            ethToEur(toEth(wshop)).then(eshop => 
                wmeShopSeller(contractAddress.contractAddress).then(wme => 
                    wsellerShopSeller(contractAddress.contractAddress).then(wseller => 
                        ethToEur(toEth(parseInt(wme) + parseInt(wseller))).then(es => res.send({
                            eurShop: eshop,
                            eurMe: es,
                            ethShop: toEth(wshop),
                            ethMe: toEth(parseInt(wme) + parseInt(wseller))
                        }))
                    )
                )
            )
        )
    }
}));
router.get('/pending-incoming', auth, asyncMiddle(async (req, res) => {
    const ethereumPayments = await getEthereumPaymentsAccount(req.user._id);
    const pendingEthereumPayments = [];
    for(let i = 0; i < ethereumPayments.length; i++) {
        await getTransaction(ethereumPayments[i].hash).then(traschan => {
            if(traschan.blockNumber == null) pendingEthereumPayments.push(ethereumPayments[i]);
        })
    }
    const mapped = _.map(
        pendingEthereumPayments, 
        pendingEthereumPayment => _.pick(
            pendingEthereumPayment, ['requestEth', 'requestWei', 'requestEur', 'recievedWei', 'recievedEur', 'transactionFeeEth', 'transactionFeeWei', 'transactionFeeEur', 'recievedEth', 'date', 'hash']
        )
    );
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}));
router.get('/finished-incoming', auth, asyncMiddle(async (req, res) => {
    const ethereumPayments = await getEthereumPaymentsAccount(req.user._id);
    const finishedEthereumPayments = [];
    for(let i = 0; i < ethereumPayments.length; i++) {
        await getTransaction(ethereumPayments[i].hash).then(traschan => {
            if(traschan.blockNumber != null) finishedEthereumPayments.push(ethereumPayments[i]);
        })
    }
    const mapped = _.map(
        finishedEthereumPayments, 
        finishedEthereumPayment => _.pick(
            finishedEthereumPayment, ['requestEth', 'requestWei', 'requestEur', 'recievedWei', 'recievedEur', 'recievedEth', 'transactionFeeEth', 'transactionFeeWei', 'transactionFeeEur', 'date', 'hash']
        )
    );
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}));
router.post('/payout/:transactionFee', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.transactionFee, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const account = await findById(req.user._id);
    const contractAddress = await getShopContractAddressAccount(req.user._id);
    const txFee = Math.round(req.params.transactionFee / 100)
    if(!account.isSells) {
        wshopShop(contractAddress.contractAddress).then(wshop => 
            ethToEur(toEth(wshop)).then(eshop => 
                wmeShop(contractAddress.contractAddress).then(wme =>
                    ethToEur(toEth(wme)).then(eme => 
                        payoutGas(account.ethereumAddress, account.ethereumPassword, contractAddress.contractAddress).then(gaschas =>
                            eurToEth(txFee).then(eschet => {
                                const gasPrice = Math.round(toWei(eschet) / gaschas) - 1;
                                console.log('aksfhasjfh');
                                payout(account.ethereumAddress, account.ethereumPassword, contractAddress.contractAddress, gaschas, gasPrice).then(async hash => {
                                    const paschay = await createPayout(account._id, toEth(wshop), toEth(wme), eshop, eme, txFee, eschet, hash);
                                    return res.send();
                                })
                            })
                        )
                    )
                )
            )
        )
    } else {
        wshopShopSeller(contractAddress.contractAddress).then(wshop => 
            ethToEur(toEth(wshop)).then(eshop => 
                wmeShopSeller(contractAddress.contractAddress).then(wme => 
                    wsellerShopSeller(contractAddress.contractAddress).then(wseller => 
                        ethToEur(toEth(parseInt(wme) + parseInt(wseller))).then(es => 
                            payoutShopSellerGas(contractAddress.contractAddress, account.ethereumAddress, account.ethereumPassword).then(gaschas => 
                                eurToEth(txFee).then(eschet => {
                                    const gasPrice = Math.round(toWei(eschet) / gaschas) -1;
                                    payoutShopSeller(contractAddress.contractAddress, account.ethereumAddress, account.ethereumPassword, gaschas, gasPrice).then(async hash => {
                                        await createPayout(account._id, toEth(wshop), toEth(parseInt(wme) + parseInt(wseller)), eshop, es, txFee, eschet, hash);
                                        await updateSellReceiptsPayoutHashContractAddress(contractAddress._id, hash);
                                        return res.send();
                                    })
                                })
                            )
                        )
                    )
                )
           )
        )
    }
}));
router.get('/pending-payouts', auth, asyncMiddle(async (req, res) => {
    const payouts = await getPayouts(req.user._id);
    const reschets = [];
    for(let i = 0; i < payouts.length; i++) {
        await getTransaction(payouts[i].hash).then(traschan => {
            if(traschan.blockNumber == null) reschets.push(payouts[i]);
        })
    }
    const mapped = _.map(reschets, reschet => _.pick(reschet, ['ethMe', 'ethShop', 'eurMe', 'eurShop', 'date', 'transactionFeeEth', 'transactionFeeEur', 'hash']))
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}));
router.get('/finished-payouts', auth, asyncMiddle(async (req, res) => {
    const payouts = await getPayouts(req.user._id);
    const reschets = [];
    for(let i = 0; i < payouts.length; i++) {
        await getTransaction(payouts[i].hash).then(traschan => {
            if(traschan.blockNumber != null) reschets.push(payouts[i]);
        })
    }
    const mapped = _.map(reschets, reschet => _.pick(reschet, ['ethMe', 'ethShop', 'eurMe', 'eurShop', 'date', 'transactionFeeEth', 'transactionFeeEur', 'hash']))
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
    
}));
router.post('/re-pay-shop', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        hash: Joi.string().required(),
        newTxFee: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const ethereumPayment = await getEthereumPaymentHash(req.body.hash);
    const contractAddress = await getShopContractAddressAccount(req.user._id);
    const newTxFee = req.body.newTxFee / 100;
    getTransaction(ethereumPayment.hash).then(traschan => 
        blockNumber().then(bloschock => 
            eurToEth(newTxFee).then(eschet => 
                balance(ethereumPayment.address).then(baschal => 
                    eurToEth(eurMeShop).then(async eschetMe => {
                        const weiShop = baschal - toWei(eschet) - toWei(eschetMe) - 300;
                        const account = await findById(req.user._id);
                        if(!account.isSells) {
                            payShopGas(ethereumPayment.address, ethereumPayment.password, contractAddress.contractAddress, baschal - toWei(eschet), toWei(eschetMe), weiShop).then(gaschas => {
                                const gasPrice = Math.round(toWei(eschet) / gaschas) - 1;
                                rePayShop(ethereumPayment.address, ethereumPayment.password, contractAddress.contractAddress, baschal - toWei(eschet), toWei(eschetMe), weiShop, gaschas, gasPrice, traschan.nonce).then(async hash => {
                                    await resendEthereumPayment(ethereumPayment.hash, hash, bloschock, eschet, newTxFee, toWei(eschet));
                                    return res.send();                            
                                })
                            })
                        } else {
                            eurToEth(0.1).then(eschetSeschel => {
                                const weiShop = baschal - toWei(eschet) - toWei(eschetMe) - toWei(eschetSeschel) - 300;
                                payShopSellerGas(contractAddress.contractAddress, ethereumPayment.address, ethereumPayment.password, toWei(eschetMe), toWei(eschetSeschel), weiShop, baschal - toWei(eschet)).then(gaschas => {
                                    const gasPrice = Math.round(toWei(eschet) / gaschas) -1;
                                    repayShopSeller(contractAddress.contractAddress, ethereumPayment.address, ethereumPayment.password, toWei(eschetMe), toWei(eschetSeschel), weiShop, baschal - toWei(eschet), gaschas, gasPrice, traschan.nonce).then(async newHash => {
                                        await resendEthereumPayment(ethereumPayment.hash, newHash, bloschock, eschet, newTxFee, toWei(eschet));
                                        return res.send();
                                    }).catch(err => res.status(500).send(err.message))
                                })
                            })
                        }
                    })
                )
            )
        )
    )
}));
router.post('/re-payout', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        hash: Joi.string().required(),
        newTxFee: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const hash = req.body.hash;
    const newTxFee = req.body.newTxFee / 100;
    const account = await findById(req.user._id);
    const contractAddress = await getShopContractAddressAccount(req.user._id);
    getTransaction(hash).then(traschan => {
        eurToEth(newTxFee).then(eschet => {
            if(!account.isSells) {
                payoutGas(account.ethereumAddress, account.ethereumPassword, contractAddress.contractAddress).then(gaschas => {
                        const gasPrice = Math.round(toWei(eschet) / gaschas) -1;
                        rePayout(account.ethereumAddress, account.ethereumPassword, contractAddress.contractAddress, gaschas, gasPrice, traschan.nonce).then(async newHash => {
                            await resendPayout(hash, newTxFee, eschet, newHash);
                            return res.send();
                        })
                
                })
            } else {
                payoutShopSellerGas(contractAddress.contractAddress, account.ethereumAddress, account.ethereumPassword).then(gaschas => {
                    const gasPrice = Math.round(toWei(eschet) / gaschas) - 1;
                    console.log(traschan);
                    repayoutShopSeller(contractAddress.contractAddress, account.ethereumAddress, account.ethereumPassword, gaschas, gasPrice, traschan.nonce).then(async newHash => {
                        await resendPayout(hash, newTxFee, eschet, newHash);
                        await updateSellReceiptsPayoutHashContractAddressPayoutHash(contractAddress._id, hash, newHash);
                        return res.send();
                    })
                })
            }
        })  
    })
}));
router.get('/incoming-tx-fee', auth, asyncMiddle(async (req, res) => {
    const contractAddress = await getShopContractAddressAccount(req.user._id);
    return res.send({ incomingTxFee: contractAddress.serviceFee })
}));
router.post('/incoming-tx-fee/:newTxFee', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.newTxFee, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await updateShopContractAddressAccountServiceFee(req.user._id, Math.round(req.params.newTxFee / 100));
    return res.send();
}))
module.exports = router;
