const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const axios = require('axios');
const url = 'https://checkout-test.adyen.com/v66/payments';
const cryptoRandomString = require('crypto-random-string');
const header = "AQExhmfxLo7NbxVLw0m/n3Q5qf3VeJlIHpJGXUFf1Xuki2hf8NPwAK5jOXEErdKVYLhYdxDBXVsNvuR83LVYjEgiTGAH-gKLZzOa0D61He6mmQVTDsIGE8BBBp5xu9Cv7FGAr8yc=-*4.}MwpTpV9z]=Gw";
const {Config, Client, CheckoutAPI } = require('@adyen/api-library');
const config = new Config();
config.apiKey = 'AQExhmfxLo7NbxVLw0m/n3Q5qf3VeJlIHpJGXUFf1Xuki2hf8NPwAK5jOXEErdKVYLhYdxDBXVsNvuR83LVYjEgiTGAH-gKLZzOa0D61He6mmQVTDsIGE8BBBp5xu9Cv7FGAr8yc=-*4.}MwpTpV9z]=Gw';
config.merchantAccount = 'PresaleDiscountECOM';
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);
router.post('/test', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        amount: Joi.number().required(),
        newBalance: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const reference = cryptoRandomString({ length: 12 });
    const random = cryptoRandomString({ length: 256 });
    console.log('ajsfhajfs');
    // return res.send();
    checkout.payments({
        amount: {
            currency: "EUR",
            value: 1000 
        },
        reference: reference,
        paymentMethod: {
            type: "ideal",
            issuer: "0721"
        },
        returnUrl: "https://presale.discount/test/" + req.body.newBalance + "/" + random,
        merchantAccount: config.merchantAccount
    }).then(rs => {
        console.log(rs);
        return res.send()
    }).catch(err => {
        console.log(err);
        return res.status(500).send();
    });
}));

module.exports = router;