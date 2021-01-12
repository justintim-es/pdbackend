const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { getSellerId } = require('../models/seller');
const { getSforgot, confirmSforgot } = require('../models/sforgot');
const cryptoRandomString = require('crypto-random-string');
const config = require('config');
const { createPsfrogot, confirmPsForgot } = require('../models/psforgot');
const client = require('twilio')(config.get('twilioAccount'), config.get('twilioAuth'));
const asyncMiddle = require('../middleware/async');
const _ = require('lodash');
router.get('/phonenumber/:code', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const sForgot = await getSforgot(req.params.code);
    if(sForgot == null) return res.status(400).send();
    await confirmSforgot(req.params.code);
    const seller = await getSellerId(sForgot.seller);
    if(seller == null) return res.send();
    const random = cryptoRandomString({ length: 6 });
    const secret = cryptoRandomString({ length: 128 });
    await createPsfrogot(seller.phonenumber, random, secret);
    console.log(random);
    return res.send({
        secret: secret,
        phonenumber: _.replace(seller.phonenumber, seller.phonenumber.substring(0, 7), '*******')
    });
    // client.messages.create({ body: 'presale.discount reset code: ' + random, from: '+3197010257295', to: '+31' + customer.phonenumber}).then(sid => {
    //     return res.send({
    //         secret: secret,
    //         phonenumber: _.replace(seller.phonenumber, customer.phonenumber.substring(0, 7), '*******')
    //     });
    // }).catch(err => res.status(500).send(err.message));
}));
router.post('/confirm', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        code: Joi.string().required(),
        secret: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmPsForgot(req.body.code, req.body.secret);
    return res.send();
}))
module.exports = router;