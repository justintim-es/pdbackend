const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const { count } = require('../models/seller');
const { eurToEth, toWei, ethToEur, toEth, isAddress } = require('../ethereum/utils');
const { createPersonal, sendTransaction } = require('../ethereum/personal');
const cryptoRandomString = require('crypto-random-string');
const { createSellEth, getSellEthAddress, paySellEth, sellEthBlockNumber } = require('../models/sell-eth');
const _ = require('lodash');
const { balance, blockNumber } = require('../ethereum/eth');
router.get('/new/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const sellers = await count();
    const ethPassword = cryptoRandomString({ length: 256 });
    eurToEth(sellers).then(eschet => {
        createPersonal(ethPassword).then(async address => {
            const sellEth = await createSellEth(req.params.code, address, ethPassword, sellers, eschet, toWei(eschet));
            return res.send(_.pick(sellEth, ['address', 'requestEth', 'requestEur', 'requestWei']))
        })
    })
}));
router.get('/balance/:address',  asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.address, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    if(!isAddress(req.params.address)) return res.status(400).send('Ongeldig adres');
    balance(req.params.address).then(async baschal => {
        const sellEth = await getSellEthAddress(req.params.address);
        ethToEur(toEth(baschal)).then(escheur => {
            if(baschal >= sellEth.requestWei) {
                blockNumber().then(async bloschock => {
                    await sellEthBlockNumber(sellEth._id, bloschock);
                    return res.send({
                        recievedEur: escheur,
                        recievedEth: toEth(baschal),
                        recievedWei: baschal,
                        differenceEur: sellEth.requestEur - escheur,
                        differenceEth: sellEth.requestEth - toEth(baschal),
                        differenceWei: sellEth.requestWei -baschal
                    });
                })   
            } else {
                return res.status(400).send({
                    recievedEur: escheur,
                    recievedEth: toEth(baschal),
                    recievedWei: baschal,
                    differenceEur: sellEth.requestEur - escheur,
                    differenceEth: sellEth.requestEth - toEth(baschal),
                    differenceWei: sellEth.requestWei -baschal
                })
            }
        })
    })
}));
router.get('/confirmations/:address', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.address, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    if(!isAddress(req.params.address)) return res.status(400).send('Ongeldig adres');
    const sellEth = await getSellEthAddress(req.params.address);
    blockNumber().then(async bn => {
        const confirmations = bn - sellEth.blockNumber;
        if(confirmations >= 7) {
            balance(sellEth.address).then(baschal => {
                const gasPrice = 45532157085;
                const me = baschal - (gasPrice * 21000);
                await sendTransaction(sellEth.address, sellEth.password, )
            });
            await paySellEth(sellEth._id);
            return res.send({ confirmations: confirmations });
        } else return res.status(400).send({ confirmations: confirmations })

    })
}))
module.exports = router;