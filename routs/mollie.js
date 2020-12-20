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
router.post('/test', (req, res) => {
    const result = Joi.validate(req.body, {
        price: Joi.number().required(),
        package: Joi.number().required()
    });
    if (result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 128 });
    const price = req.body.price;
    mollieClient.customers_payments.create({})
    mollieClient.payments.create({
        amount: {
            value: price + '.00',
            currency: 'EUR'
        },
        description: 'test payment',
        locale: 'nl_NL',
        redirectUrl: 'https://presale.discount/test/pay-complete/' + random,
    }).then(async payment => {
        await createTest(payment.id, random, price, req.body.package);
        return res.send(payment.getCheckoutUrl());
    }).catch(err => res.status(400).send(err))
});
router.get('/payment/:random', async (req, res) => {
    const result = Joi.validate(req.params.random, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const test = await getTest(req.params.random);
    mollieClient.payments.get(test.paymentId).then(payment => {
        if(payment.isPaid()) return res.send(_.pick(test, ['package']));
        return res.status(400).send(payment.status);
    }).catch(err => res.status(500).send(err.message))
})

module.exports = router;