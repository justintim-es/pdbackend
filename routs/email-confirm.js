const express = require('express');
const router = express.Router();
const Joi = require('joi');
const cryptoRandomString = require('crypto-random-string');
const { createEmailConfirm, confirmEmailConfirm, deleteOutdated, createEmailCustomerConfirm, confirmEmailCustomerConfirm, deleteOutdatedCustomer, deleteOutdatedSeller, createEmailSellerConfirm, confirmEmailSellerConfirm } = require('../models/email-confirm');
const asyncMiddle = require('../middleware/async');
const axios = require('axios');
router.post('/check-email', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
    });    
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 256 });
    const email = req.body.email.toLowerCase().trim();
    await deleteOutdated();
    await createEmailConfirm(email, random);
    axios.post('https://presale.discount/email/confirm', {
        mail: req.body.email.toLowerCase(),
        link: 'https://presale.discount/confirm/' + random
    }).then(resches => res.send()).catch(err => res.status(500).send(err.message))
    
}));
router.post('/check-email-for-seller', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        seller: Joi.string().required()
    });    
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 256 });
    const email = req.body.email.toLowerCase().trim();
    await deleteOutdated();
    await createEmailConfirm(email, random);
    axios.post('https://presale.discount/email/confirm', {
        mail: req.body.email.toLowerCase(),
        link: 'https://presale.discount/confirm-sales/' + req.body.seller + '/' + random
    }).then(resches => res.send()).catch(err => res.status(500).send(err.message))
}));
router.post('/check-customer', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        package: Joi.string().required(),
        subdomain: Joi.string().required(),
    });    
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 256 });
    const email = req.body.email.toLowerCase().trim();
    await deleteOutdatedCustomer();
    await createEmailCustomerConfirm(email, random);
    axios.post('https://presale.discount/email/confirm', {
        mail: req.body.email.toLowerCase(),
        link: 'https://' + req.body.subdomain.toLowerCase() + '.presale.discount/confirm/' + req.body.package + '/' + random
    }).then(resches => res.send()).catch(err => res.status(500).send(err.message))
}));
router.post('/check-seller', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const random = cryptoRandomString({ length: 256 });
    console.log(random);
    await deleteOutdatedSeller();
    await createEmailSellerConfirm(email, random)
    return res.send();
}));

router.post('/confirm-email/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmEmailConfirm(req.params.code);
    return res.send();
}));
router.post('/confirm-customer/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmEmailCustomerConfirm(req.params.code);
    return res.send();
}));
router.post('/confirm-seller/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmEmailSellerConfirm(req.params.code);
    return res.send();
}))

module.exports = router;