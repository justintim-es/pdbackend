const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { balance, blockNumber, gasPrice } = require('../ethereum/eth');
const { getEthereumPayment, payEthereumPayment, blockNumberEthereumPayment, isBlockNumberEthereumPaymentTrue, getEthereumPaymentById } = require('../models/ethereum-payment');
const { getPackage } = require('../models/package');
const _ = require('lodash');
const { price } = require('../ethereum/etherscan');
const { toEth, ethToEur, toWei } = require('../ethereum/utils');
const { eur, dollar } = require('../ethereum/exchangerates');
const asyncMiddle = require('../middleware/async');
const { createBalance } = require('../models/balance');
const { sendTransaction } = require('../ethereum/personal');
const { findById } = require('../models/account');
const { createEthereumPayout } = require('../models/ethereum-payouts');
router.get('/balance/:address', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.address, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const address = req.params.address;
    const ethereumPayment = await getEthereumPayment(address);
    balance(address).then(async baschal => {
        const eschet = toEth(baschal);
        ethToEur(eschet).then(async escheur => {
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
            } else if(parseInt(baschal) >= parseInt(ethereumPayment.requestWei) && ethereumPayment.isPayed) {
                return res.status(400).send('Deze ethereum betaling is al verwerkt');
            } else {   
                return res.status(402).send({
                    wei: baschal,
                    eth: eschet,
                    eur: escheur,
                    differenceWei: ethereumPayment.requestWei - baschal,
                    differenceEth: ethereumPayment.requestEth - eschet,
                    differenceEur: ethereumPayment.requestEur - escheur
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
        if(confirmations >= 1 && !ethereumPayment.isPayed) {
            balance(ethereumPayment.address).then(async ethBalance => {
                if(ethBalance == 0) return res.status(402).send('De ethereum transactie is teruggekeerd vanwege een "fork"');
                const package = await getPackage(ethereumPayment.package);
                const balance = await createBalance(package.pack, ethereumPayment.subdomain, package._id, ethereumPayment.customer);
                await payEthereumPayment(ethereumPayment._id);
                const account = await findById(ethereumPayment.account);
                gasPrice().then(gp => {
                    console.log(gp);
                    const wei = ethBalance - (gp * 21000);
                    console.log(wei);
                    sendTransaction(ethereumPayment.address, ethereumPayment.password, wei, account.ethereumAddress).then(async hash => {
                        await createEthereumPayout(account._id, hash);
                        return res.send({ confirmations: confirmations, balance: balance.balance });
                    }).catch(err => res.status(500).send(err.message));
                })
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
}))
module.exports = router;
