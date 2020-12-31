const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const axios = require('axios');
const url = 'https://checkout-test.adyen.com/v66/payments';
const cryptoRandomString = require('crypto-random-string');
const header = "AQEqhmfuXNWTK0Qc+iSAgGErpuiebIJeDpxfVnEFr1+WcQ3xXt1HZSyEWqh9EMFdWw2+5HzctViMSCJMYAc=-+VzlJ0v13KzqwBULqmwo7VZhiNKT3IEb6LETZy8R5Rg=-^]hpEv~WA7>{>uC~";
const {Config, Client, CheckoutAPI } = require('@adyen/api-library');
const config = new Config({ apiKey: header, merchantAccount: "PresaleDiscountECOM"});
const { createTest, getTest } = require('../models/test');
const _ = require('lodash');
const client = new Client({
    config,
    httpClient: {
      async request(endpoint, json, config, isApiKeyRequired, requestOptions) {
          const response = await axios({
              method: 'POST',
              url: endpoint,
              data: JSON.parse(json),
              headers: {
                  "X-API-Key": header,
                  "Content-type": "application/json"
              },
          })
          return response.data;
      }
    }
});
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

router.post('/test', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        price: Joi.number().required(),
        package: Joi.number().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const price = req.body.price;
    const package = req.body.package;
    const reference = cryptoRandomString({ length: 12 });
    const random = cryptoRandomString({ length: 256 });
    checkout.payments({
        amount: {
            currency: "EUR",
            value: Math.round(price * 100)
        },
        reference: reference,
        paymentMethod: {
            type: "ideal",
            issuer: "1121"
        },
        returnUrl: "https://presale.discount/test/pay-complete/" + random,
        merchantAccount: "PresaleDiscountECOM",
    }).then(async rs => {
        await createTest(rs.paymentData, random, price, package, reference);
        return res.send(rs.action.url);

    }).catch(err => {
        return res.status(500).send(err.data);
    });
}));
router.post('/payment', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        random: Joi.string().required(),
        payload: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const test = await getTest(req.body.random);
    checkout.paymentsDetails({
        paymentData: test.paymentData,
        details: {
            payload: req.body.payload
        }
    }).then(rs => {
        rs.resultCode == 'Authorised' ? res.send(_.pick(test, ['package'])) : res.status(400).send('Betaling is niet voldaan');
    }).catch(err => res.status(500).send(err.data));
}));


module.exports = router;