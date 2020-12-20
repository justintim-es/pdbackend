const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { createPoken, getPoken, payPoken, getPokens } = require('../models/poken');
const asyncMiddle = require('../middleware/async');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { getCustomerEmail } = require('../models/customer');
const config = require('config');
const jwt = require('jsonwebtoken');
const { payBalance } = require('../models/balance');
const { createReceipt } = require('../models/receipt');
const { findBySubdomain } = require('../models/account');
const { incTransactions } = require('../models/stat');
const { getLock, createLock } = require('../models/lock');
const auth = require('../middleware/auth');
const { create } = require('lodash');
router.post('/create', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        amount: Joi.number().required(),
        subdomain: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const poken = await createPoken(req.body.amount, req.body.subdomain);
    return res.send(_.pick(poken, ['_id']))
}));
router.get('/amount/:id', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const poken = await getPoken(req.params.id);
    if(poken == null) return res.status(400).send('Geen betaling gevonden');
    if(poken.isPayed) return res.status(400).send('Betaling is al betaald');
    return res.send(_.pick(poken, ['amount']));
}));
// router.post('/login', asyncMiddle(async (req, res) => {
//     const result = Joi.validate(req.body, {
//         email: Joi.string().required(),
//         password: Joi.string().required(),
//         poken: Joi.string().required(),
//         subdomain: Joi.string().required(),
//         package: Joi.string().required()
//     });
//     if(result.error) return res.status(400).send(result.error.details[0].message);
//     const email = req.body.email;
//     const lock = await getLock(email);
//     if(lock != null && lock.attempts > 3 && lock.date > new Date()) return res.status(400).send('Deze e-mail is op slot voor 30 minuten'); 
//     const customer = await getCustomerEmail(email);
//     if(customer == null) {
//         await createLock(email);
//         return res.status(400).send('Ongeldig e-mail of wachtwoord');
//     }
//     const validPasssword = await bcrypt.compare(req.body.password, customer.password);
//     if(!validPasssword) {
//         await createLock(email);
//         return res.status(400).send('Ongeldig e-mail of wachtwoord');
//     } 
//     const poken = await getPoken(req.body.poken);
//     const subdomain = req.body.subdomain;
//     const balance = await payBalance(customer._id, subdomain, poken.amount);
//     const receipt = await createReceipt(poken.amount, customer._id, req.body.package, subdomain, balance.balance);
//     const account = await findBySubdomain(subdomain);
//     // await incTransactions(account._id);
//     await payPoken(poken._id);
//     return res.send(_.pick(receipt, ['amount', 'newBalance']));
// }));
router.get('/check-payment/:id', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.id, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const poken = await getPoken(req.params.id);
    if(!poken.isPayed) return res.status(400).send();
    return res.send(); 
}));
router.get('/pokens/:subdomain', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.subdomain, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const pokens = await getPokens(req.params.subdomain);
    const mapped = _.map(pokens, poken => _.pick(poken, ['amount', 'date', 'isPayed']));
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date))) 
}));

module.exports = router;