const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { balance, blockNumber, gasPrice } = require('../ethereum/eth');
const { getEthereumPayment, payEthereumPayment, blockNumberEthereumPayment, isBlockNumberEthereumPaymentTrue, getEthereumPaymentById, getEthereumPayments, getEthereumPaymentsAccount } = require('../models/ethereum-payment');
const { getPackage, incSold } = require('../models/package');
const _ = require('lodash');
const { price } = require('../ethereum/etherscan');
const { toEth, ethToEur, toWei, isAddress, eurToEth } = require('../ethereum/utils');
const { eur, dollar } = require('../ethereum/exchangerates');
const asyncMiddle = require('../middleware/async');
const { createBalance } = require('../models/balance');
const { sendTransaction } = require('../ethereum/personal');
const { findById } = require('../models/account');
const { createEthereumPayout } = require('../models/ethereum-payouts');
const auth = require('../middleware/auth');
const { createEthereumAccountTransaction, getEthereumAccountTransactions } = require('../models/ethereum-account-transaction');
const { createPaymentBalanceBridge } = require('../models/paymentbalancebridge');
const { createEthereumTxFee, getEthereumTxFee } = require('../models/ethereum-tx-feee');
const { address, txGas } = require('../ethereum/constants');
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
                        differenceEur: ethereumPayment.requestEur - escheur,
                        _id: ethereumPayment._id
                    })
                }).catch(err => res.status(500).send(err.message))                
            } else if(parseInt(baschal) >= parseInt(ethereumPayment.requestWei) && ethereumPayment.isBlockNumber) {
                return res.send({
                    wei: baschal,
                    eth: eschet,
                    eur: escheur,
                    differenceWei: ethereumPayment.requestWei - baschal,
                    differenceEth: ethereumPayment.requestEth - eschet,
                    differenceEur: ethereumPayment.requestEur - escheur,
                    _id: ethereumPayment._id,
                    requestEth: ethereumPayment.requestEth,
                    requestWei: ethereumPayment.requestWei,
                    requestEur: ethereumPayment.requestEur
                })
            } else {   
                return res.status(402).send({
                    wei: baschal,
                    eth: eschet,
                    eur: escheur,
                    differenceWei: ethereumPayment.requestWei - baschal,
                    differenceEth: ethereumPayment.requestEth - eschet,
                    differenceEur: ethereumPayment.requestEur - escheur,
                    requestEth: ethereumPayment.requestEth,
                    requestWei: ethereumPayment.requestWei,
                    requestEur: ethereumPayment.requestEur
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
                gasPrice().then(gp => {
                    price().then(prischic => {
                        const prischicesche = prischic.data.result.ethusd;
                        eurToEth(1.49).then(eschet => {
                            const feeWei = toWei(eschet);
                            sendTransaction(ethereumPayment.address, ethereumPayment.password, feeWei, address, gp).then(async feeHash => {
                                await createEthereumTxFee(ethereumPayment._id, gp, prischicesche, feeHash, feeWei);
                                const restWei = ethBalance - feeWei - (gp * txGas * 2); 
                                sendTransaction(ethereumPayment.address, ethereumPayment.password, restWei, account.ethereumAddress, gp).then(async hash => {
                                    await createEthereumTxFee(ethereumPayment._id, gp, prischicesche, hash, restWei);
                                    await payEthereumPayment(ethereumPayment._id, restWei, prischicesche);
                                    const balance = await createBalance(package.pack, ethereumPayment.subdomain, package._id, ethereumPayment.customer);
                                    await createPaymentBalanceBridge(ethereumPayment._id, balance._id);
                                    await incSold(package._id); 
                                    return res.send({ confirmations: confirmations, balance: balance.balance });
                                }).catch(err => res.status(500).send(err.message));
                            }).catch(err => {
                                return res.status(500).send(err.message);
                            });
                        }).catch(err => res.status(500).send());
                    }).catch(err => res.status(500).send(err));
                }).catch(err => res.status(500).send(err.message));
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
            gasPrice().then(gp => {
                sendTransaction(account.ethereumAddress, account.ethereumPassword, toWei(eth), address, gp).then(hash => {
                    const txWei = gp * 21000;
                    const txEschet = toEth(txWei);
                    const txDollar = txEschet * prischic.data.result.ethusd;
                    eur().then(async escheur => {
                        const escheuroscho = escheur.data.rates.EUR * txDollar;
                        const market = escheur.data.rates.EUR * prischic.data.result.ethusd;
                        await createEthereumAccountTransaction(account._id, hash, market, amount, eth, toWei(eth), escheuroscho, txEschet, txWei);
                        return res.send();
                    }).catch(err => res.status(500).send(err));
                }).catch(err => res.status(500).send(err.message));
            }).catch(err => res.status(500).send(err.message));
        }).catch(err => res.status(500).send(err));
    }).catch(err => res.status(500).send(err));
}));
router.get('/transactions-account', auth, asyncMiddle(async (req, res) => {
    const ethereumAccountTransactions = await getEthereumAccountTransactions(req.user._id);
    const mapped = _.map(ethereumAccountTransactions, ethereumAccountTransaction => 
        _.pick(ethereumAccountTransaction, ['hash', 'market', 'amountEur', 'amountEth', 'amountWei', 'gasFeeEur', 'gasFeeEth', 'gasFeeWei', 'date'])
    ); 
    return res.send(
      mapped.sort((a, b) => new Date(b.date) - new Date(a.date))  
    );
}));
router.get('/payments-package/:package', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.package, Joi.string().required());
    if(result.errore) return res.status(400).send(result.error.details[0].message);
    const payments = await getEthereumPayments(req.params.package);
    const mapped = _.map(payments, payment => _.pick(payment, ['requestEth', 'requestWei', 'requestEur', 'date', '_id']));
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}));
router.get('/payments-account', auth, asyncMiddle(async (req, res) => {
    const ethereumPayments = await getEthereumPaymentsAccount(req.user._id);
    const sorted = ethereumPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    const reschet = [];
    for(let i = 0; i < sorted.length; i++) {
        const ethereumTxFees = await getEthereumTxFee(sorted[i]._id);
        await eur().then(escheur => {
            const txFees = [];
            const recievedEur = escheur.data.rates.EUR * sorted[i].recievedMarket * toEth(sorted[i].recievedWei);
            for(let e = 0; e < ethereumTxFees.length; e++) {
                const txFeeEur = escheur.data.rates.EUR * ethereumTxFees[e].market * toEth(ethereumTxFees[e].gasPrice * 21000);
                const txValueEur = escheur.data.rates.EUR * ethereumTxFees[e].market * toEth(ethereumTxFees[e].wei);
                txFees.push({
                    txFeeEur: txFeeEur,
                    hash: ethereumTxFees[e].hash,
                    eth: toEth(ethereumTxFees[e].wei),
                    txValueEur: txValueEur,
                    txFeeEth: toEth(ethereumTxFees[e].gasPrice * 21000)
                }); 
            }
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
        }).catch(err => res.status(500).send())
    }
    return res.send(reschet);
}));
module.exports = router;
