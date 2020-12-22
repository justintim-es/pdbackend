const bcrypt = require('bcrypt');
const express = require('express');
 const router = express.Router();
const Joi = require('joi');
const { createCustomer, getCustomerEmail, updatePassword } = require('../models/customer');
const { getCustomerEmailFromCode } = require('../models/email-confirm');
const { getPackage } = require('../models/package');
const { createPayment } = require('../models/payment');
const { findById } = require('../models/account');
const asyncMiddle = require('../middleware/async');
const { createMollieClient } = require('@mollie/api-client');
const cryptoRandomString = require('crypto-random-string');
const { createCforgot, getCforgot, useCforgot } = require('../models/cforgot');
const { getPcforgot, usePcforgot } = require('../models/pcforgot');
const { getLock, createLock } = require('../models/lock');

const axios = require('axios');
const { getMollieKey } = require('../models/mollie-key');
// todo add token
router.post('/create', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        phonenumber: Joi.string().required(),
        password: Joi.string().required(),
        code: Joi.string().required(),
        package: Joi.string().required(),
        subdomain: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = await getCustomerEmailFromCode(req.body.code);
    const random = cryptoRandomString({ length: 256 });
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const customer = await createCustomer(email, req.body.phonenumber, hashedPassword);
    const package = await getPackage(req.body.package);
    const account = await findById(package.account);
    const mollieKey = await getMollieKey(account._id);
    const mollieClient = createMollieClient({ apiKey: mollieKey.key });
    mollieClient.payments.create({
        amount: {
            value: package.price + '.00',
            currency: 'EUR'
        },
        description: account.tradeName,
        locale: 'nl_NL',
        redirectUrl: 'https://' + req.body.subdomain  + '.presale.discount/checkout/' + random,
        applicationFee: {
            amount: {
                currency: 'EUR',
                value: '0.49'
            },
            description: account.tradeName
        }
    }).then(async payment => {
        await createPayment(payment.id, random, req.body.package, customer._id);
        return res.send(payment.getCheckoutUrl());
    }).catch(err => res.status(400).send(err))
}));
router.post('/login', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        password: Joi.string().required(),
        package: Joi.string().required(),
        subdomain: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const customer = await getCustomerEmail(req.body.email.toLowerCase().trim());
    if(customer == null) return res.status(400).send('Ongeldig e-mail of wachtwoord');
    const validPasssword = await bcrypt.compare(req.body.password, customer.password);
    if(!validPasssword) return res.status(400).send('Ongeldig e-mail of wachtwoord');
    const package = await getPackage(req.body.package);
    const account = await findById(package.account);
    const mollieKey = await getMollieKey(account._id);
    const mollieClient = createMollieClient({ apiKey: mollieKey.key });
    const random = cryptoRandomString({ length: 256 });
    mollieClient.payments.create({
        amount: {
            value: package.price + '.00',
            currency: 'EUR'
        },
        locale: 'nl_NL',
        description: account.tradeName,
        redirectUrl: 'https://' + req.body.subdomain + '.presale.discount/checkout/' + random,
        applicationFee: {
            amount: {
                currency: 'EUR',
                value: '0.49'
            },
            description: account.tradeName
        }
    }).then(async payment => {
        await createPayment(payment.id, random, req.body.package, customer._id);
        return res.send(payment.getCheckoutUrl());
    }).catch(err => res.status(400).send(err))
}));
router.post('/pay-login', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const lock = await getLock(email);
    if(lock != null && lock.attempts > 3 && lock.date > new Date()) return res.status(400).send('Deze e-mail is op slot voor 30 minuten');
    const customer = await getCustomerEmail(email);
    if(customer == null) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    } 
    const validPasssword = await bcrypt.compare(req.body.password, customer.password);
    if(!validPasssword) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    } 
    const token = customer.genereateAuthToken();
    return res.header('x-auth-token', token).send();
}))
router.post('/forgot', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        packagePayment: Joi.string().required(),
        subdomain: Joi.string().required(),
        isPackage: Joi.boolean().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const customer = await getCustomerEmail(email);
    if(customer == null) return res.send();
    const random = cryptoRandomString({ length: 256 });
    await createCforgot(random, customer._id);
    axios.post('https://presale.discount/email/reset', {
        mail: email,
        link: 'https://' + req.body.subdomain + '.presale.discount/reset/' + req.body.packagePayment + '/' + random + '/' + req.body.isPackage
    }).then(rs => res.send()).catch(err => res.status(500).send(err.message));
}));
router.post('/receipts-forgot', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const customer = await getCustomerEmail(email);
    if(customer == null) return res.send();
    const random = cryptoRandomString({ length: 256 });
    await createCforgot(random, customer._id);
    axios.post('https://presale.discount/email/reset', {
        mail: email,
        link: 'https://receipts.presale.discount/confirm/' + random 
    }).then(rs => res.send()).catch(err => res.status(500).send(err.message));
}));
router.post('/reset', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        verificationCode: Joi.string().required(),
        secret: Joi.string().required(),
        password: Joi.string().required(),
        code: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const code = req.body.code;
    const verificationCode = req.body.verificationCode;
    const secret = req.body.secret;
    const cforgot = await getCforgot(code);
    if(cforgot == null) return res.status(400).send('oeps er ging iets mis');
    if(cforgot.isUsed) return res.status(400).send('Het wachtwoord voor deze code is al aangepast');
    if(!cforgot.isConfirmed) return res.status(400).send('Oeps er ging iets mis');
    const pcforgot = await getPcforgot(verificationCode, secret);
    if(pcforgot == null) return res.status(400).send('oeps er ging iets mis');
    if(pcforgot.isUsed) return res.status(400).send('Het wachtwoord voor deze code is al aangepast');
    if(!pcforgot.isConfirmed) return res.status(400).send('Oeps er ging iets mis');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await updatePassword(cforgot.customer, hashedPassword);
    await useCforgot(code);
    await usePcforgot(verificationCode, secret);
    return res.send();
}));
router.post('/receipts', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const customer = await getCustomerEmail(req.body.email.toLowerCase().trim());
    if(customer == null) return res.status(400).send('Ongeldig e-mail of wachtwoord');
    const validPasssword = await bcrypt.compare(req.body.password, customer.password);
    if(!validPasssword) return res.status(400).send('Ongeldig e-mail of wachtwoord');
    const token = customer.genereateAuthToken();
    return res.header('x-auth-token', token).send();
}))

module.exports = router;