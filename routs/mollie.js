const express = require('express');
const router = express.Router();
const { createMollieClient } = require('@mollie/api-client');
const apiKey = 'test_J9SMxwveQ4WA8QN67rsubAAzfDJxKF';
const mollieClient = createMollieClient({ apiKey: apiKey });
const Joi = require('joi');
const mongoose = require('mongoose');
const { testSchema, createTest, getTest } = require('../models/test');
const cryptoRandomString = require('crypto-random-string');
const _ = require('lodash');
const auth = require('../middleware/auth');
const asyncMiddle = require('../middleware/async');
const { getPackage } = require('../models/package');
const { findById } = require('../models/account');
const { getMollieKey } = require('../models/mollie-key');
const { createPayment } = require('../models/payment');
const { getById } = require('../models/customer');
router.post('/test', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        price: Joi.number().required(),
        package: Joi.number().required()
    });
    if (result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 128});
    const price = req.body.price;
    mollieClient.payments.create({
        amount: {
            value: price + '.00',
            currency: 'EUR'
        },
        description: 'test payment',
        locale: 'nl_NL',
        redirectUrl: 'https://localhost:5001/test/pay-complete/' + random,
    }).then(async payment => {
        await createTest(payment.id, random, price, req.body.package);
        return res.send(payment.getCheckoutUrl());
    }).catch(err => { console.log(err); res.status(400).send(err);});
}));
router.get('/payment/:random', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.random, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const test = await getTest(req.params.random);
    mollieClient.payments.get(test.paymentData).then(payment => {
        if(payment.isPaid()) return res.send(_.pick(test, ['package']));
        return res.status(400).send(payment.status);
    }).catch(err => res.status(500).send(err.message))
}));
router.get('/new-payment/:package', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.package, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const package = await getPackage(req.params.package);
    const account = await findById(package.account);
    const customer = await getById(req.user._id);
    const random = cryptoRandomString({ length: 256 })
    const mollieKey = await getMollieKey(account._id);
    const mollieClient = createMollieClient({ apiKey: 'live_TFTnAdd3h9xUUxGrPGykSScEze2dPU' });
    mollieClient.customers_payments.create({
        amount: {
            currency: 'EUR',
            value: package.price + '.00'
        },
        description: account.tradeName,
        redirectUrl: 'https://localhost:5001/checkout/' + random,
        locale: 'nl_NL',
        applicationFee: {
            amount: {
                currency: 'EUR',
                value: '0.20'
            },
            description: 'presale.discount'
        } 
    }).then(async moschol => {
        await createPayment(moschol.id, random, package._id, customer._id);
        return res.send(moschol.getPaymentUrl());
    }).catch(err => {
        throw new Error(err);
    })
}))

module.exports = router;