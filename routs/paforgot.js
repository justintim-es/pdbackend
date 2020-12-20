const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const { getAforgot, confirmAforgot } = require('../models/aforgot');
const { findById } = require('../models/account');
const _ = require('lodash');
const { createPaforgot } = require('../models/paforgot');
const cryptoRandomString = require('crypto-random-string');
const { confirmPaforgot } = require('../models/paforgot');
const config = require('config');
const client = require('twilio')(config.get('twilioAccount'), config.get('twilioAuth'));

router.get('/phonenumber/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send();
    const code = req.params.code;
    const aforgot = await getAforgot(code);
    if(aforgot == null) return res.send();
    await confirmAforgot(code);
    const account = await findById(aforgot.account);
    if(account == null) return res.send();
    const random = cryptoRandomString({ length: 6 });
    const secret = cryptoRandomString({ length: 128 });
    console.log(random);
    await createPaforgot(account.phonenumber, random, secret); 
    client.messages.create({ body: 'presale.discount reset code: ' + random, from: '+3197010257295', to: '+31' + account.phonenumber}).then(sid => {
        return res.send({ 
            phonenumber: _.replace(account.phonenumber, account.phonenumber.substring(0, 7), '*******'),
            secret: secret
        });
    }).catch(err => res.status(500).send(err.message));
}));
router.post('/confirm', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        password: Joi.string().required(),
        secret: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmPaforgot(req.body.password, req.body.secret);
    return res.send();
}));

module.exports = router;