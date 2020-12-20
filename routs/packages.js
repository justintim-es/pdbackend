const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const { createPackage, getPackages, activate, deactivate, getActivePackages, deschel } = require('../models/package');
const { getPackageBalance } = require('../models/balance');
const asyncMiddle = require('../middleware/async');
const _ = require('lodash');
const { findBySubdomain } = require('../models/account');
const auth = require('../middleware/auth');
router.post('/create', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        package: Joi.number().required(),
        discount: Joi.number().required(),
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const package = req.body.package;
    const discount = req.body.discount;
    const price = package - discount;
    await createPackage(package, discount, price, req.user._id);
    return res.send();
}));
router.get('/packages', auth, asyncMiddle(async (req, res) => {
    const packages = await getPackages(req.user._id);
    return res.send(_.map(packages, package => _.pick(package, ['_id', 'price', 'discount', 'pack', 'sold', 'isActive'])));
}));
router.get('/subdomain/:subdomain', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.subdomain, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const account = await findBySubdomain(req.params.subdomain);
    const packages = await getActivePackages(account._id);
    return res.send(_.map(packages, package => _.pick(package, ['_id', 'price', 'discount', 'pack'])))
}));
router.post('/activate/:id', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await activate(req.user._id, req.params.id);
    return res.send();
}));
router.post('/deactivate/:id', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await deactivate(req.user._id, req.params.id);
    return res.send();
}));
router.delete('/package/:id', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const packageBalance = await getPackageBalance(req.params.id);
    if(packageBalance != 0) return res.status(400).send('Deze kaart kan pas verwijdert worden als het openstaande saldo € 0 is');
    await deschel(req.params.id);
    return res.send();
}))
module.exports = router;