const express = require('express');
const router = express.Router();
const Joi = require('joi');
const cryptoRandomString = require('crypto-random-string');
const { createEmailConfirm, confirmEmailConfirm, deleteOutdated, createEmailCustomerConfirm, confirmEmailCustomerConfirm, deleteOutdatedCustomer } = require('../models/email-confirm');
const asyncMiddle = require('../middleware/async');
const axios = require('axios');
router.post('/check-email', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required()
    });    
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 256 });
    const email = req.body.email.toLowerCase().trim();
    await deleteOutdated();
    await createEmailConfirm(email, random);
    axios.post('https://presale.discount/email/confirm', {
        mail: req.body.email.toLowerCase(),
        link: 'https://presale.discount/confirm/' + random
    })
    return res.send();
}));
router.post('/check-customer', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        package: Joi.string().required(),
        subdomain: Joi.string().required(),
    });    
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 128 });
    const email = req.body.email.toLowerCase().trim();
    await deleteOutdatedCustomer();
    await createEmailCustomerConfirm(email, random);
    axios.post('https://presale.discount/email/confirm', {
        mail: req.body.email.toLowerCase(),
        link: 'https://' + req.body.subdomain.toLowerCase() + '.presale.discount/confirm/' + req.body.package + '/' + random
    })
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

module.exports = router;