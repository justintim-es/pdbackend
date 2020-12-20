const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { createMollieClient } = require('@mollie/api-client');
const apiKey = 'test_J9SMxwveQ4WA8QN67rsubAAzfDJxKF';
const { getPayment, fin, finalizePayment } = require('../models/payment');
const { getPackage } = require('../models/package');
const { createBalance, getBalance, getBalances, payBalance, getCustomerBalances, getBalanceById, getPackageBalance  } = require('../models/balance');
const asyncMiddle = require('../middleware/async');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const { getPoken } = require('../models/poken');
const auth = require('../middleware/auth');
const { incSold } = require('../models/package');
const { createPaymentBalanceBridge, getPaymentBalanceBridge } = require('../models/paymentbalancebridge');
const { createReceipt } = require('../models/receipt');
const { payPoken } = require('../models/poken');
const { findBySubdomain } = require('../models/account');
const { getMollieKey } = require('../models/mollie-key');
router.post('/create', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        code: Joi.string().required(),
        subdomain: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const code = req.body.code;
    const payment = await getPayment(code);
    const account = await findBySubdomain(req.body.subdomain);
    const mollieKey = await getMollieKey(account._id);
    const mollieClient = createMollieClient({ apiKey: mollieKey.key });
    mollieClient.payments.get(payment.paymentId).then(async mpayment => {
        if(mpayment.isPaid()) {
            const package = await getPackage(payment.package);
            if(payment.isFinalized) {
                const balance = await getBalance(payment.customer, package._id); 
                return res.status(400).send(_.pick(balance, ['balance']))
            }
            const balance = await createBalance(package.pack, req.body.subdomain, package._id, payment.customer);
            await finalizePayment(code);
            await incSold(package._id);
            await createPaymentBalanceBridge(payment._id, balance._id);
            return res.send(_.pick(balance, ['balance']))
        }
        return res.status(400).send(payment.status);
    }).catch(err => res.status(500).send(err.message))
}));
router.get('/subdomain/:subdomain', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.subdomain, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const balances = await getBalances(req.user._id, req.params.subdomain);
    return res.send(_.map(balances, balance => _.pick(balance, ['_id', 'balance', 'package'])));
}));
router.get('/customer', auth, asyncMiddle(async (req, res) => {
    const balances = await getCustomerBalances(req.user._id);
    return res.send(_.map(balances, balance => _.pick(balance, ['balance', 'subdomain', 'package'])))
}));
router.get('/payment/:id', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const paymentBalanceBridge = await getPaymentBalanceBridge(req.params.id);
    if(paymentBalanceBridge == null) return res.status(400).send();
    const balance = await getBalanceById(paymentBalanceBridge.balance);
    return res.send(_.pick(balance, ['balance']))
}));
router.get('/package/:id', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const pb = await getPackageBalance(req.params.id);
    return res.send({
        balance: pb
    });
}))
router.post('/pay', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        poken: Joi.string().required(),
        subdomain: Joi.string().required(),
        package: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const poken = await getPoken(req.body.poken);
    if(poken == null) return res.status(400).send();
    const balance = await payBalance(req.user._id, req.body.subdomain, req.body.package, poken.amount);
    const receipt = await createReceipt(poken.amount, req.user._id, req.body.package, req.body.subdomain, balance.balance);
    await payPoken(poken._id);
    return res.send(_.pick(receipt, ['amount', 'newBalance']));
}));
module.exports = router;