const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { balance, blockNumber, gasPrice, getTransaction } = require('../ethereum/eth');
const { getEthereumPayment, payEthereumPayment, blockNumberEthereumPayment, isBlockNumberEthereumPaymentTrue, getEthereumPaymentById, getEthereumPayments, getEthereumPaymentsAccount, createEthereumPayment, getEthereumPaymentHash, resendEthereumPayment } = require('../models/ethereum-payment');
const { getPackage, incSold } = require('../models/package');
const _ = require('lodash');
const { price, estimated } = require('../ethereum/etherscan');
const { toEth, ethToEur, toWei, isAddress, eurToEth } = require('../ethereum/utils');
const { eur, dollar } = require('../ethereum/exchangerates');
const asyncMiddle = require('../middleware/async');
const { createBalance, getBalance } = require('../models/balance');
const { sendTransaction, createPersonal, resendTransaction } = require('../ethereum/personal');
const { findById } = require('../models/account');
const { createEthereumPayout } = require('../models/ethereum-payouts');
const auth = require('../middleware/auth');
const { createEthereumAccountTransaction, getEthereumAccountTransactions, resendEthereumAccountTransaction } = require('../models/ethereum-account-transaction');
const { createPaymentBalanceBridge } = require('../models/paymentbalancebridge');
const { createEthereumTxFee, getEthereumTxFee, resendEthereumTxFee } = require('../models/ethereum-tx-feee');
const { address, txGas } = require('../ethereum/constants');
const { getById } = require('../models/customer');
const cryptoRandomString = require('crypto-random-string');
const { create } = require('lodash');
const { getSellerId, updateSellerTxFee } = require('../models/seller');
const { createSellReceipt, getSellReceipts } = require('../models/sell-receipt');
const { createEthereumSellerTransaction, getEthereumSellerTransactions, updateEthereumSellerTransaction } = require('../models/ethereum-seller-transaction');
router.get('/balance/:address', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.address, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const address = req.params.address;
    const ethereumPayment = await getEthereumPayment(address);
    balance(address).then(async baschal => {
        const eschet = toEth(baschal);
        ethToEur(eschet).then(async escheur => {
            console.log(baschal);
            console.log(ethereumPayment.requestWei);
            if(parseInt(baschal) >= parseInt(ethereumPayment.requestWei) && !ethereumPayment.isBlockNumber) {
                blockNumber().then(async bn => {
                    await blockNumberEthereumPayment(ethereumPayment._id, bn);
                    await isBlockNumberEthereumPaymentTrue(ethereumPayment._id);
                    return res.send({
                        wei: baschal,
                        eth: eschet,
                        eur: escheur,
                        differenceWei: ethereumPayment.requestWei - baschal,
                        differenceEth: ethereumPayment.requestEth - eschet,
                        differenceEur: (parseInt(ethereumPayment.requestEur) + parseFloat(ethereumPayment.serviceFee)).toFixed(2) - escheur,
                        _id: ethereumPayment._id,
                        serviceFee: ethereumPayment.serviceFee
                    })
                }).catch(err => res.status(500).send(err.message))                
            } else if(parseInt(baschal) >= parseInt(ethereumPayment.requestWei) && ethereumPayment.isBlockNumber) {
                return res.send({
                    wei: baschal,
                    eth: eschet,
                    eur: escheur,
                    differenceWei: ethereumPayment.requestWei - baschal,
                    differenceEth: ethereumPayment.requestEth - eschet,
                    differenceEur: (parseInt(ethereumPayment.requestEur) + parseFloat(ethereumPayment.serviceFee)).toFixed(2) - escheur,
                    _id: ethereumPayment._id,
                    requestEth: ethereumPayment.requestEth,
                    requestWei: ethereumPayment.requestWei,
                    requestEur: ethereumPayment.requestEur,
                    serviceFee: ethereumPayment.serviceFee
                })
            } else {   
                return res.status(402).send({
                    wei: baschal,
                    eth: eschet,
                    eur: escheur,
                    differenceWei: ethereumPayment.requestWei - baschal,
                    differenceEth: ethereumPayment.requestEth - eschet,
                    differenceEur: (parseInt(ethereumPayment.requestEur) + parseFloat(ethereumPayment.serviceFee)).toFixed(2) - escheur,
                    requestEth: ethereumPayment.requestEth,
                    requestWei: ethereumPayment.requestWei,
                    requestEur: ethereumPayment.requestEur,
                    serviceFee: ethereumPayment.serviceFee
                });
            }
        }).catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err))
}));
router.get('/confirmations/:id', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const ethereumPayment = await getEthereumPaymentById(req.params.id);
    blockNumber().then(async bn => {
        const confirmations = bn - ethereumPayment.blockNumber;
        if(confirmations >= 7 && !ethereumPayment.isPayed) {
            balance(ethereumPayment.address).then(async ethBalance => {
                if(ethBalance == 0) return res.status(402).send('De ethereum transactie is teruggekeerd vanwege een "fork"');
                if(ethBalance <= ethereumPayment.requestEth) return res.status(402).send('Verstuur meer ethereum naar het adres');
                const package = await getPackage(ethereumPayment.package);
                const account = await findById(ethereumPayment.account);
                price().then(prischic => {
                    const prischicesche = prischic.data.result.ethusd;
                    dollar().then(async doschol => {
                        const doschollaschar = doschol.data.rates.USD * 1.99;
                        const eschet = doschollaschar / prischicesche;
                        const feeWei = toWei(eschet.toString().substring(0, 20));
                        const doscholFee = doschol.data.rates.USD * 1;
                        const weiFee = toWei(doscholFee / prischicesche);
                        const gpFee = Math.round(weiFee / 21000);
                        const gpAccount = doschol.data.rates.USD * account.transactionFee;
                        const gpAccountwei = toWei(gpAccount / prischicesche);
                        const gpAccountFee = Math.round(gpAccountwei / 21000);
                        if(account.isSells) {
                            const sellDollar = doschol.data.rates.USD * 0.10;
                            const sellEschet = sellDollar / prischicesche;
                            const sellWei = toWei(sellEschet);
                            const seller = await getSellerId(account.sells);
                            console.log(seller);
                            sendTransaction(ethereumPayment.address, ethereumPayment.password, sellWei, seller.ethereumAddress, gpFee).then(async sellHash => {
                                await createEthereumTxFee(ethereumPayment._id, gpFee, prischicesche, sellHash, sellWei);
                                await createSellReceipt(seller._id, sellHash, 0.10, sellWei, sellEschet);
                                sendTransaction(ethereumPayment.address, ethereumPayment.password, feeWei, address, gpFee).then(async feeHash => {
                                    const restWei = ethBalance - sellWei - feeWei - (gpFee * txGas * 2) - (gpAccountFee * txGas);
                                    await createEthereumTxFee(ethereumPayment._id, gpFee, restWei, feeHash, feeWei);
                                    sendTransaction(ethereumPayment.address, ethereumPayment.password, restWei, account.ethereumAddress, gpAccountFee).then(async finalHash => {
                                        await createEthereumTxFee(ethereumPayment._id, gpAccountFee, prischicesche, finalHash, restWei);
                                        await payEthereumPayment(ethereumPayment._id, restWei, prischicesche, finalHash);
                                        const balance = await createBalance(package.pack, ethereumPayment.subdomain, package._id, ethereumPayment.customer);
                                        await createPaymentBalanceBridge(ethereumPayment._id, balance._id);
                                        await incSold(package._id);
                                        return res.send({ confirmations: confirmations, balance: balance.balance });
                                    })
                                })
                            })
                        } else {
                            sendTransaction(ethereumPayment.address, ethereumPayment.password, feeWei, address, gpFee).then(async feeHash => {
                                await createEthereumTxFee(ethereumPayment._id, gpFee, prischicesche, feeHash, feeWei);
                                const restWei = ethBalance - feeWei - (gpFee * txGas) - (gpAccountFee * txGas); 
                                sendTransaction(ethereumPayment.address, ethereumPayment.password, restWei, account.ethereumAddress, gpAccountFee).then(async hash => {
                                    console.log('stopmining');
                                    await createEthereumTxFee(ethereumPayment._id, gpAccountFee, prischicesche, hash, restWei);
                                    await payEthereumPayment(ethereumPayment._id, restWei, prischicesche, hash);
                                    const balance = await createBalance(package.pack, ethereumPayment.subdomain, package._id, ethereumPayment.customer);
                                    await createPaymentBalanceBridge(ethereumPayment._id, balance._id);
                                    await incSold(package._id); 
                                    return res.send({ confirmations: confirmations, balance: balance.balance });
                                }).catch(err => res.status(500).send(err.message));
                            }).catch(err => {
                                return res.status(500).send(err.message);
                            });
                        }
                    }).catch(err => res.status(500).send())
                }).catch(err => res.status(500).send(err));
            }).catch(err => res.status(500).send(err.message))
        } else if(confirmations >= 7 && ethereumPayment.isPayed) return res.status(409).send('De ethereum transactie is al verwerkt');
        else return res.status(400).send({ confirmations: confirmations });
    }).catch(err => res.status(500).send(err));
}));
router.get('/test/:amount', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.amount, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    dollar().then(doschol => {
        const doschollaschar = doschol.data.rates.USD * req.params.amount;
        price().then(prischic => {
            const eth = doschollaschar / prischic.data.result.ethusd;
            console.log(eth);
            return res.send({
                wei: toWei(eth),
                eth: eth,
                eur: req.params.amount
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).send(err);
        })
    }).catch(err => {
        console.log(err);
        return res.status(500).send(err);
    })   
}));
router.get('/balance-account', auth, asyncMiddle(async (req, res) => {
    const account = await findById(req.user._id);
    balance(account.ethereumAddress).then(baschal => {
        const eschet = toEth(baschal);
        ethToEur(eschet).then(escheur => 
            res.send({
                wei: baschal,
                eth: eschet,
                eur: escheur
            })
        ).catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err));
}));
router.get('/balance-seller', auth, asyncMiddle(async (req, res) => {
    const seller = await getSellerId(req.user._id);
    balance(seller.ethereumAddress).then(baschal => {
        const eschet = toEth(baschal);
        ethToEur(eschet).then(escheur => res.send({
                wei: baschal,
                eth: eschet,
                eur: escheur
            })
        )
    })
}))
router.post('/transfer-account', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        address: Joi.string().required(),
        amount: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const address = req.body.address;
    const amount = req.body.amount;
    if(!isAddress(address)) return res.status(400).send('Ongeldig adres');
    const account = await findById(req.user._id);
    dollar().then(doschol => {
        const doschollaschar = doschol.data.rates.USD * amount;
        price().then(prischic => {
            const eth = doschollaschar / prischic.data.result.ethusd;
            const gasDollar = doschol.data.rates.USD * account.transactionFee;
            const gasEth = gasDollar / prischic.data.result.ethusd;
            const gasPrice = toWei(gasEth) / txGas;
            sendTransaction(account.ethereumAddress, account.ethereumPassword, toWei(eth), address, gasPrice).then(hash => {
                const txWei = gp * txGas;
                const txEschet = toEth(txWei);
                const txDollar = txEschet * prischic.data.result.ethusd;
                eur().then(async escheur => {
                    const market = escheur.data.rates.EUR * prischic.data.result.ethusd;
                    await createEthereumAccountTransaction(account._id, hash, market, amount, eth, toWei(eth), (account.transactionFee / 100), txEschet, txWei);
                    return res.send();
                }).catch(err => res.status(500).send(err));
                }).catch(err => res.status(500).send(err.message));
        }).catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err));
}));
router.post('/transfer-all-account/:address', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.address, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    if(!isAddress(req.params.address)) return res.status(400).send('Ongeldig adres');
    const account = await findById(req.user._id);
    const transactionFeeEur = account.transactionFee / 100;
    eurToEth(transactionFeeEur).then(eschet => {
        const wei = toWei(eschet);
        const gp = Math.round(wei / txGas);
        balance(account.ethereumAddress).then(baschal => {
            const txValue = baschal - (gp * txGas);
            sendTransaction(account.ethereumAddress, account.ethereumPassword, txValue, req.params.address, gp).then(hash => {
                price().then(prischic => {
                    eur().then(escheur => {
                        const market = escheur.data.rates.EUR * prischic.data.result.ethusd;
                        const txValueEth = toEth(txValue);
                        ethToEur(txValueEth).then(txValueEur => {
                            ethToEur(toEth(gp * txGas)).then(async txFeeEur => {
                                await createEthereumAccountTransaction(account._id, hash, market, txValueEur, txValueEth, txValue, txFeeEur, toEth(gp * txGas), (gp * txGas));
                                return res.send();
                            })
                        }) 
                    })
                })
            })
        })
    })
}));
router.post('/transfer-seller', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        address: Joi.string().required(),
        amount: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const address = req.body.address;
    const amount = req.body.amount;
    if(!isAddress(address)) return res.status(400).send('Ongeldig adres');
    const seller = await getSellerId(req.user._id);
    dollar().then(doschol => {
        const doschollaschar = doschol.data.rates.USD * amount;
        price().then(prischic => {
            const eth = doschollaschar / prischic.data.result.ethusd;
            const gasDollar = doschol.data.rates.USD * (seller.txFee / 100);
            const gasEth = gasDollar / prischic.data.result.ethusd;
            const gasPrice = Math.round(toWei(gasEth) / txGas);
            sendTransaction(seller.ethereumAddress, seller.ethereumPassword, toWei(eth), address, gasPrice).then(hash => {
                eur().then(async escheur => {
                    const market = escheur.data.rates.EUR * prischic.data.result.ethusd;
                    await createEthereumSellerTransaction(seller._id, hash, market, amount, eth, toWei(eth), (seller.txFee / 100), gasEth, toWei(eth));
                    return res.end();
                }) 
            })
        })
    })
}))
router.post('/transfer-all-seller/:address', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.address, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    if(!isAddress(req.params.address)) return res.status(400).send('Ongeldig adres');
    const seller = await getSellerId(req.user._id);
    const txFeeEur = seller.txFee / 100;
    eurToEth(txFeeEur).then(eschet => {
        const wei = toWei(eschet);
        const gp = Math.round(wei / txGas);
        balance(seller.ethereumAddress).then(baschal => {
            const txValue = baschal - (gp * txGas);
            sendTransaction(seller.ethereumAddress, seller.ethereumPassword, txValue, req.params.address, gp).then(hash => {
                price().then(prischic => {
                    eur().then(escheur => {
                        const market = escheur.data.rates.EUR * prischic.data.result.ethusd;
                        const txValueEth = toEth(txValue);
                        ethToEur(txValueEth).then(txValueEur => {
                            ethToEur(toEth(gp * txGas)).then(async txFeeEur => {
                                await createEthereumSellerTransaction(seller._id, hash, market, txValueEur, txValueEth, txValue, txFeeEur, toEth(gp * txGas), (gp * txGas)  )
                                return res.send();
                            })
                        })
                    })
                })
            })
        })
    })
}))
router.get('/transactions-account-pending', auth, asyncMiddle(async (req, res) => {
    const ethereumAccountTransactions = await getEthereumAccountTransactions(req.user._id);
    const pendings = [];
    for(let i = 0; i < ethereumAccountTransactions.length; i++) {
        await getTransaction(ethereumAccountTransactions[i].hash).then(traschan => {
            if(traschan.blockNumber == null) pendings.push(ethereumAccountTransactions[i]);
        })
    }
    const mapped = _.map(pendings, pending => 
        _.pick(pending, ['hash', 'market', 'amountEur', 'amountEth', 'amountWei', 'gasFeeEur', 'gasFeeEth', 'gasFeeWei', 'date'])
    ); 
    return res.send(
      mapped.sort((a, b) => new Date(b.date) - new Date(a.date))  
    );
}));
router.get('/transactions-account-finished', auth, asyncMiddle(async (req, res) => {
    const ethereumAccountTransactions = await getEthereumAccountTransactions(req.user._id);
    const finisheds = [];
    for(let i = 0; i < ethereumAccountTransactions.length; i++) {
        await getTransaction(ethereumAccountTransactions[i].hash).then(traschan => {
            if(traschan.blockNumber != null) finisheds.push(ethereumAccountTransactions[i]);
        })
    }
    const mapped = _.map(finisheds, finished => 
        _.pick(finished, ['hash', 'market', 'amountEur', 'amountEth', 'amountWei', 'gasFeeEur', 'gasFeeEth', 'gasFeeWei', 'date'])
    ); 
    return res.send(
      mapped.sort((a, b) => new Date(b.date) - new Date(a.date))  
    );
}));
router.get('/transactions-seller-pendings', auth, asyncMiddle(async (req, res) => {
    const ethereumSellerTransactions = await getEthereumSellerTransactions(req.user._id);
    const pendings = [];
    for(let i = 0; i < ethereumSellerTransactions.length; i++) {
        await getTransaction(ethereumSellerTransactions[i].hash).then(traschan => {
            if(traschan.blockNumber == null) pendings.push(ethereumSellerTransactions[i]);
        });
    }
    const mapped = _.map(pendings, pending => _.pick(pending, ['hash', 'market','amountEur', 'amountEth', 'amountWei', 'gasFeeEur', 'gasFeeEth', 'gasFeeWei', 'date']));
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}))
router.get('/transactions-seller-finisheds', auth, asyncMiddle(async (req, res) => {
    const ethereumSellerTransactions = await getEthereumSellerTransactions(req.user._id);
    const finisheds = [];
    for(let i = 0; i < ethereumSellerTransactions.length; i++) {
        await getTransaction(ethereumSellerTransactions[i].hash).then(traschan => {
            if(traschan.blockNumber != null) finisheds.push(ethereumSellerTransactions[i]);
        })
    }
    const mapped = _.map(finisheds, finished => _.pick(finished, ['hash', 'market','amountEur', 'amountEth', 'amountWei', 'gasFeeEur', 'gasFeeEth', 'gasFeeWei', 'date']));
    console.log(mapped);
    return res.send(
        mapped.sort((a, b) => new date(b.date) - new Date(a.date))
    );
}))
router.get('/payments-package/:package', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.package, Joi.string().required());
    if(result.errore) return res.status(400).send(result.error.details[0].message);
    const payments = await getEthereumPayments(req.params.package);
    const mapped = _.map(payments, payment => _.pick(payment, ['requestEth', 'requestWei', 'requestEur', 'date', '_id']));
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}));
router.get('/payments-account-pending', auth, asyncMiddle(async (req, res) => {
    const ethereumPayments = await getEthereumPaymentsAccount(req.user._id);
    const sorted = ethereumPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    const reschet = [];
    for(let i = 0; i < sorted.length; i++) {
        const ethereumTxFees = await getEthereumTxFee(sorted[i]._id);
        let txFees = [];
        await getTransaction(sorted[i].hash).then(async traschan => {
            console.log(traschan);
            if(traschan.blockNumber == null) {
                await eur().then(escheur => {
                    const recievedEur = escheur.data.rates.EUR * sorted[i].recievedMarket * toEth(sorted[i].recievedWei);
                    txFees = paymentsAccount(sorted[i], escheur.data.rates.EUR, ethereumTxFees);
                    reschet.push({
                        requestEth: sorted[i].requestEth,
                        requestWei: sorted[i].requestWei,
                        requestEur: sorted[i].requestEur,
                        recievedWei: sorted[i].recievedWei,
                        recievedEur: recievedEur,
                        recievedEth: toEth(sorted[i].recievedWei),
                        date: sorted[i].date,
                        txFees: txFees
                    });
                })
            }
        });
    }
    return res.send(reschet);
}));
router.get('/payments-account-finished', auth, asyncMiddle(async (req, res) => {
    const ethereumPayments = await getEthereumPaymentsAccount(req.user._id);
    const sorted = ethereumPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    const reschet = [];
    for(let i = 0; i < sorted.length; i++) {
        const ethereumTxFees = await getEthereumTxFee(sorted[i]._id);
        let txFees = [];
        await getTransaction(sorted[i].hash).then(async tx => {
            if(tx.blockNumber != null) {
                await eur().then(escheur => {
                    const recievedEur = escheur.data.rates.EUR * sorted[i].recievedMarket * toEth(sorted[i].recievedWei);
                    txFees = paymentsAccount(sorted[i], escheur.data.rates.EUR, ethereumTxFees);
                    reschet.push({
                        requestEth: sorted[i].requestEth,
                        requestWei: sorted[i].requestWei,
                        requestEur: sorted[i].requestEur,
                        recievedWei: sorted[i].recievedWei,
                        recievedEur: recievedEur,
                        recievedEth: toEth(sorted[i].recievedWei),
                        date: sorted[i].date,
                        txFees: txFees
                    });
                })
            }
        })
    }
    return res.send(reschet);
}));
router.get('/earned-seller-pendings', auth, asyncMiddle(async (req, res) => {
    const earneds = await getSellReceipts(req.user._id);
    const pendings = [];
    for(let i = 0; i < earneds.length; i++) {
        await getTransaction(earneds[i].hash).then(traschan => {
            if(traschan.blockNumber == null) pendings.push(earneds[i]);
        })
    }
    const mapped = _.map(pendings, pending => _.pick(pending, ['hash', 'eur', 'wei', 'eth', 'date']))
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}));
router.get('/earned-seller-finisheds', auth, asyncMiddle(async (req, res) => {
    const earneds = await getSellReceipts(req.user._id);
    const finisheds = [];
    for(let i = 0; i < earneds.length; i++) {
        await getTransaction(earneds[i].hash).then(traschan => {
            if(traschan.blockNumber != null) finisheds.push(earneds[i]);
        })
    }
    const mapped = _.map(finisheds, finished => _.pick(finished, ['hash', 'eur', 'wei', 'eth', 'date']))
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}));
const paymentsAccount = (sorted, escheurRate, ethereumTxFees) => {
    const txFees = [];
    for(let e = 0; e < ethereumTxFees.length; e++) {
        const txFeeEur =  escheurRate * ethereumTxFees[e].market * toEth(ethereumTxFees[e].gasPrice * 21000);
        const txValueEur = escheurRate * ethereumTxFees[e].market * toEth(ethereumTxFees[e].wei);
        txFees.push({
            txFeeEur: txFeeEur,
            hash: ethereumTxFees[e].hash,
            eth: toEth(ethereumTxFees[e].wei),
            txValueEur: txValueEur,
            txFeeEth: toEth(ethereumTxFees[e].gasPrice * 21000)
        });    
    }
    return txFees;
}
router.get('/estimated-confirmation-time/:txFee', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.txFee, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const escheur = req.params.txFee / 100;
    eurToEth(escheur).then(eschet => {
        console.log(eschet);
        const wei = toWei(eschet);
        const gasPrice = Math.round(wei / 21000);
        estimated(gasPrice).then(esches => {
            const minutes = Math.round(esches.data.result / 60);
            return res.send({ minutes: minutes });
        });
    })
}));
router.get('/new-payment/:package', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.package, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const package = await getPackage(req.params.package);
    console.log(package);
    const customer = await getById(req.user._id);
    console.log(customer);
    const account = await findById(package.account);
    console.log(account);
    dollar().then(async doschol => {
        // console.log(doschol);
        const doschollaschar = doschol.data.rates.USD * package.price;
        price().then(async prischic => {
            // console.log(prischic);
            const eth =  doschollaschar / prischic.data.result.ethusd;
            const cryptoPass = cryptoRandomString({ length: 256 });
            createPersonal(cryptoPass).then(async address => {
                console.log(address);
                const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain);
                return res.status(201).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei']));
            }).catch(err => res.status(500).send(err.message));
        }).catch(err => res.status(500).send());
    }).catch(err => res.status(500).send());
}));
router.post('/resend-account-incoming', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        hash: Joi.string().required(),
        newTxFee: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const hash = req.body.hash;
    const account = await findById(req.user._id);
    eurToEth(req.body.newTxFee).then(eschet => {
        const gp = Math.round(toWei(eschet) / txGas);
        getTransaction(hash).then(async traschan => {
            if(traschan.blockNumber == null) {
                const ethereumPayment = await getEthereumPaymentHash(hash);
                balance(ethereumPayment.address).then(baschal => {
                    const newTxValue = baschal - (gp * txGas);
                    resendTransaction(ethereumPayment.address, ethereumPayment.password, newTxValue, account.ethereumAddress, gp, traschan.nonce).then(newHash => {
                       blockNumber().then(async bn  => {
                            await resendEthereumPayment(hash, newHash, bn);
                            await resendEthereumTxFee(hash, gp, newHash, newTxValue);
                            return res.send(newHash);  
                       })
                    })
                })
            }
            else return res.status(400).send('Transactie is al aangekomen');
        })
    })
}));
router.post('/resend-account-outgoing', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        hash: Joi.string().required(),
        newTxFee: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const hash = req.body.hash;
    const account = await findById(req.user._id);
    eurToEth(req.body.newTxFee).then(eschet => {
        const gp = Math.round(toWei(eshet) /  txGas);
        getTransaction(hash).then(async traschan => {
            if(trachan.blockNumber == null) {
                resendTransaction(traschan.from, account.ethereumPassword, traschan.value, trachan.to, gp, traschan.nonce).then(async newHash => {
                    ethToEur(toEth(gp)).then(async gpEur =>{
                        await resendEthereumAccountTransaction(hash, gpEur, toEth(gp), gp);
                        return res.send();
                    })
                })
            } else return res.status(400).send('Transactie is toch nog verzonden');
        }) 
    })
}));
router.post('/resend-seller', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        hash: Joi.string().required(),
        newTxFee: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const seller = await getSellerId(req.user._id);
    const hash = req.body.hash;
    eurToEth(req.body.newTxFee).then(eschet => {
        const gp = Math.round(toWei(eschet) / txGas);
        getTransaction(hash).then(async traschan => {
            if(traschan.blockNumber == null) {
                resendTransaction(traschan.from, seller.ethereumAddress, traschan.value, traschan.to, gp, traschan.nonce).then(async newHash => {
                    ethToEur(toEth(gp)).then(async escheur => {
                        await updateEthereumSellerTransaction(seller._id, hash, escheur, toEth(gp), gp);
                        return res.send();
                    })
                })                
            }
        })
    })
}))
module.exports = router;
