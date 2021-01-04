const config = require('config');
const passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema
.is().min(8)                                    
.is().max(20)                                  
.has().uppercase()                              
.has().lowercase()                              
.has().digits()
.has().symbols()                                 
.has().not().spaces()   
const bcrypt = require('bcrypt');                      
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { createAccount, findOne, findBySubdomain, updatePassword, getAccounts } = require('../models/account');
const { getEmailFromCode } = require('../models/email-confirm');
const asyncMiddle = require('../middleware/async');
const _ = require('lodash');
const { finalizeSubdomain } = require('../models/subdomain');
const { createStat } = require('../models/stat');
const { getLock, createLock } = require('../models/lock');
const { createAforgot, getAforgot, useAforgot } = require('../models/aforgot');
const { getPaforgot, usePaforgot } = require('../models/paforgot');
const cryptoRandomString = require('crypto-random-string');
const axios = require('axios');
const { createPersonal } = require('../ethereum/personal');
router.post('/create', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        phonenumber: Joi.number().required(),
        password: Joi.string().required(),
        tradeName: Joi.string().required(),
        address: Joi.string().required(),
        houseNumber: Joi.number().required(),
        postCode: Joi.string().required(),
        subdomain: Joi.string().required(),
        emailCode: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const password = req.body.password;
    const subdomain = req.body.subdomain.toLowerCase();
    if(!schema.validate(password)) return res.status(400).send(result.error.details[0].message);
    const email = await getEmailFromCode(req.body.emailCode);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const ethereumPassword = cryptoRandomString({ length: 256 });
    createPersonal(ethereumPassword).then(async address => {
        const account = await createAccount(
            email, 
            req.body.phonenumber,
            hashedPassword, 
            req.body.tradeName, 
            req.body.address,
            req.body.houseNumber,
            req.body.postCode,
            subdomain,
            address,
            ethereumPassword
        );
        const token = account.genereateAuthToken();
        await finalizeSubdomain(subdomain);
        return res.header('x-auth-token', token).send(_.pick(account, ['tradeName', 'isSubdomain']));
    }).catch(err => res.status(500).send(err.message))
}));

router.post('/login', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const lock = await getLock(email);
    if(lock != null && lock.attempts > 3 && lock.date > new Date()) return res.status(400).send('Deze e-mail is op slot voor 30 minuten'); 
    const account = await findOne(email);
    if(!account) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    } 
    const validateResult = await bcrypt.compare(req.body.password, account.password);
    if(!validateResult) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    }
    const token = account.genereateAuthToken()
    return res.header('x-auth-token', token).send(_.pick(account, ['tradeName', 'isSubdomain', 'subdomain']));
}));
router.post('/forgot', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();
    const account = await findOne(email);
    if(account == null) return res.send();
    const random = cryptoRandomString({ length: 256 });
    console.log(random);
    axios.post('https://presale.discount/email/reset', {
        mail: req.body.email.toLowerCase(),
        link: 'https://presale.discount/reset/' + random
    })
    await createAforgot(random, account._id);
    return res.send();
}));
router.post('/reset', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        verificationCode: Joi.string().required(),
        secret: Joi.string().required(),
        password: Joi.string().required(),
        code: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const code = req.body.code;
    const verificationCode = req.body.verificationCode;
    const secret = req.body.secret;
    const aforgot = await getAforgot(code);
    if(aforgot == null) return res.status(400).send();
    if(aforgot.isUsed) return res.status(400).send('Het wachtwoord voor deze code is al aangepast');
    if(!aforgot.isConfirmed) return res.status(400).send('Oeps er ging iets mis1');
    const paforgot = await getPaforgot(verificationCode, secret);
    if(paforgot == null) return res.status(400).send('Oeps er ging iets mis1');
    if(paforgot.isUsed) return res.status(400).send('Het wachtwoord voor deze code is al aangepast');
    if(!paforgot.isConfirmed) return res.status(400).send('Oeps er ging iets mis');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await updatePassword(paforgot.phonenumber, hashedPassword);
    await useAforgot(code);
    await usePaforgot(verificationCode, secret);
    return res.send();
}));
router.get('/subdomains', asyncMiddle(async (req, res) => {
    const accounts = await getAccounts();
    return res.send(_.map(accounts, account => _.pick(account, ['subdomain'])))
})) 
// this route is currently changed and not working
router.get('/info/:subdomain', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.subdomain, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const account = await findBySubdomain(req.params.subdomain);
    return res.send(_.pick(account, ['kvk', 'btw', 'address', 'phonenumber', 'houseNumber']));
}));
module.exports = router;