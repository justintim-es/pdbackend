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
const { dollar } = require('../ethereum/exchangerates');
const { price } = require('../ethereum/etherscan');
const { toWei } = require('../ethereum/utils');
const { createEthereumPayment } = require('../models/ethereum-payment');
const { createPersonal } = require('../ethereum/personal');
const _ = require('lodash');
const { getMollieKey } = require('../models/mollie-key');
const { getCustomerConfirm } = require('../models/phonenumber-confirm');
const { getShopContractAddressAccount } = require('../models/shop-contract-address');
// todo add token
router.post('/create', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        phonenumber: Joi.string().required(),
        password: Joi.string().required(),
        code: Joi.string().required(),
        package: Joi.string().required(),
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = await getCustomerEmailFromCode(req.body.code);
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const confirm = await getCustomerConfirm(req.body.phonenumber);
    if(!confirm.isConfirmed) return res.status(400).send('Telefoonnummer is niet bevestigd');
    const package = await getPackage(req.body.package);
    const account = await findById(package.account);
    const contractAddress = await getShopContractAddressAccount(account._id);
    dollar().then(async doschol => {
        price().then(async prischic => {
            const cryptoPass = cryptoRandomString({ length: 256 });
            createPersonal(cryptoPass).then(async address => {
                if(account.isFiftyFifty) {
                    const fee = (parseFloat(contractAddress.serviceFee / 100) + parseFloat(0.5)) / 2;
                    const price = parseInt(package.price) + parseFloat(fee); 
                    const doschollaschar = doschol.data.rates.USD * price;
                    const eth = doschollaschar / prischic.data.result.ethusd;
                    const customer = await createCustomer(email, req.body.phonenumber, hashedPassword);
                    const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain, fee);
                    const token = customer.genereateAuthToken();
                    return res.header('x-auth-token', token).status(200).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei', 'serviceFee']))
                } else if(account.isChargeCustomer) {
                    const fee = parseFloat(0.5) + parseFloat(contractAddress.serviceFee / 100);
                    const price = parseInt(package.price) + parseFloat(fee);
                    const doschollaschar = doschol.data.rates.USD * price;
                    const eth = doschollaschar / prischic.data.result.ethusd;
                    const customer = await createCustomer(email, req.body.phonenumber, hashedPassword);
                    const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain, fee);
                    const token = customer.genereateAuthToken();
                    return res.header('x-auth-token', token).status(200).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei', 'serviceFee']))
                } else {
                    const doschollaschar = doschol.data.rates.USD * package.price;
                    const eth =  doschollaschar / prischic.data.result.ethusd;
                    const customer = await createCustomer(email, req.body.phonenumber, hashedPassword);
                    const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain, 0);
                    const token = customer.genereateAuthToken();
                    return res.header('x-auth-token', token).status(200).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei', 'serviceFee']));
                }
            }).catch(err => res.status(500).send(err.message));
        }).catch(err => res.status(500).send());
    }).catch(err => res.status(500).send());
}));
router.post('/login', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        password: Joi.string().required(),
        package: Joi.string().required(),
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const customer = await getCustomerEmail(email);
    const lock = await getLock(email);
    if(lock != null && lock.attempts > 3 && lock.date > new Date()) return res.status(400).send('Deze e-mail is op slot voor 30 minuten'); 
    if(customer == null)  {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    }
    const validPasssword = await bcrypt.compare(req.body.password, customer.password);
    if(!validPasssword) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    }
    const package = await getPackage(req.body.package);
    const account = await findById(package.account);
    const contractAddress = await getShopContractAddressAccount(account._id);
    const token = customer.genereateAuthToken();
    dollar().then(async doschol => {
        price().then(async prischic => {
            const cryptoPass = cryptoRandomString({ length: 256 });
            createPersonal(cryptoPass).then(async address => {
                if(account.isFiftyFifty) {
                    const fee = (parseFloat(contractAddress.serviceFee / 100) + parseFloat(0.5)) / 2;
                    const price = parseInt(package.price) + parseFloat(fee);
                    const doschollaschar = doschol.data.rates.USD * price;
                    const eth = doschollaschar / prischic.data.result.ethusd;
                    const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain, fee);
                    return res.status(201).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei', 'serviceFee']));
                } else if(account.isChargeCustomer) {
                    const fee = parseFloat(0.5) + parseFloat(contractAddress.serviceFee / 100);
                    const price = parseInt(package.price) + parseFloat(0.5) + parseFloat(contractAddress.serviceFee / 100);
                    const doschollaschar = doschol.data.rates.USD * price;
                    const eth = doschollaschar / prischic.data.result.ethusd;
                    const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain, fee);
                    return res.status(201).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei', 'serivceFee']));
                } else {
                    const doschollaschar = doschol.data.rates.USD * package.price;
                    const eth =  doschollaschar / prischic.data.result.ethusd;
                    const ethereumPayment = await createEthereumPayment(account._id, package._id, customer._id, address, cryptoPass, toWei(eth), eth, package.price, account.subdomain, 0);
                    return res.status(201).send(_.pick(ethereumPayment, ['address', 'requestEur', 'requestEth', 'requestWei', 'serviceFee']));
                }
            }).catch(err => res.status(500).send(err.message));
        }).catch(err => res.status(500).send());
    }).catch(err => res.status(500).send());
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
    const email = req.body.email.toLowerCase().trim();
    const customer = await getCustomerEmail(email);
    const lock = await getLock(email);
    if(lock != null && lock.attempts > 3 && lock.date > new Date()) return res.status(400).send('Deze e-mail is op slot voor 30 minuten'); 
    if(customer == null)  {
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
}));

module.exports = router;