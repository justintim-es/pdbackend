const express = require('express');
const router = express.Router();
const config = require('config');
var Web3 = require('web3');
var web3 = new Web3(config.get('web3Connect'));
var Eth = require('web3-eth');
var eth = new Eth(config.get('web3Connect'));
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const auth = require('../middleware/auth');
const { createEthereum } = require('../models/ethereum');
const { updateEthereum } = require('../models/account');
router.post('/enable/:address', auth, asyncMiddle(req, res => {
    const result = Joi.validate(req.body, {
        address: Joi.string().required(),
        isCustomerPay: Joi.boolean().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const address = req.body.address;
    if(!web3.utils.isAddress(address)) return res.status(400).send('Ongeldig ethereum adres');
    await createEthereum(req.user._id, address, req.body.isCustomerPay);
    await updateEthereum(req.user._id);
    return res.send();
}));

module.exports = router;
