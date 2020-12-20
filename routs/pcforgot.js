const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { confirmCforgot, getCforgot } = require('../models/cforgot');
const { getById } = require('../models/customer');
const { createPcfrogot, confirmPcForgot } = require('../models/pcforgot');
const _ = require('lodash');
const asyncMiddle = require('../middleware/async');
const cryptoRandomString = require('crypto-random-string');
const config = require('config');
const client = require('twilio')(config.get('twilioAccount'), config.get('twilioAuth'));
    

router.post('/phonenumber/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const cfgorgot = await getCforgot(req.params.code);
    if(cfgorgot == null) return res.send();
    await confirmCforgot(req.params.code);
    const customer = await getById(cfgorgot.customer);
    if(customer == null) return res.send();
    const random = cryptoRandomString({ length: 6 });
    const secret = cryptoRandomString({ length: 128 });
    await createPcfrogot(customer.phonenumber, random, secret);
    client.messages.create({ body: 'presale.discount reset code: ' + random, from: '+3197010257295', to: '+31' + customer.phonenumber}).then(sid => {
        return res.send({
            secret: secret,
            phonenumber: _.replace(customer.phonenumber, customer.phonenumber.substring(0, 7), '*******')
        });
    }).catch(err => res.status(500).send(err.message));
}));
router.post('/confirm', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        code: Joi.string().required(),
        secret: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmPcForgot(req.body.code, req.body.secret);
    return res.send();
}))
module.exports = router;