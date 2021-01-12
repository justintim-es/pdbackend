const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { 
    createPhonenumberConfirm, 
    createPhonenumberCustomerConfirm,
    confirmPhonenumber, 
    confirmCustomerPhonenumber,
    deleteOutDated,
    deleteOutDatedCustomer,
    createPhonenumberSellerConfirm,
    confirmSellerPhonenumber,
} = require('../models/phonenumber-confirm');
const cryptoRandomString = require('crypto-random-string');
const asyncMiddle = require('../middleware/async');
const config = require('config');
const { deleteOutdatedSeller } = require('../models/email-confirm');
const client = require('twilio')(config.get('twilioAccount'), config.get('twilioAuth'));
router.get('/check-phonenumber/:phonenumber', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.phonenumber, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const code = cryptoRandomString({ length: 6 });
    await deleteOutDated();
    await createPhonenumberConfirm(req.params.phonenumber, code);
    // client.messages.create({ body: 'presale.discount verificatie code: ' + code, from: '+3197010257295', to: '+31' + req.params.phonenumber}).then(sid => {
    //     return res.send();
    // }).catch(err => res.status(500).send(err.message));
    console.log(code);
    return res.send();
}));
router.get('/check-customer/:phonenumber', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.phonenumber, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const code = cryptoRandomString({ length: 6 });
    await deleteOutDatedCustomer();
    await createPhonenumberCustomerConfirm(req.params.phonenumber, code);
    // client.messages.create({ body: 'presale.discount verificatie code: ' + code, from: '+3197010257295', to: '+31' + req.params.phonenumber}).then(sid => {
    //     return res.send();
    // }).catch(err => res.status(500).send(err.message));
    console.log(code);
    return res.send();
}));
router.get('/check-seller/:phonenumber', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.phonenumber, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const code = cryptoRandomString({ length: 6 });
    console.log(code);
    await deleteOutdatedSeller()
    await createPhonenumberSellerConfirm(req.params.phonenumber, code);
    return res.send();
}))
router.post('/confirm-phonenumber', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        phonenumber: Joi.number().required(),
        code: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmPhonenumber(req.body.phonenumber, req.body.code);
    return res.send();
}));
router.post('/confirm-customer', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        phonenumber: Joi.number().required(),
        code: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmCustomerPhonenumber(req.body.phonenumber, req.body.code);
    return res.send();
}));
router.post('/confirm-seller', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        phonenumber: Joi.number().required(),
        code: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmSellerPhonenumber(req.body.phonenumber, req.body.code);
    return res.send();
}))
module.exports = router;