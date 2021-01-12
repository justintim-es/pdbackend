const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { createSeller, getSeller, count, getSellerId, updateSellerTxFee, getSellerEmail, updatePassword } = require('../models/seller');
const cryptoRandomString = require('crypto-random-string');
const { getSellerEmailFromCode } = require('../models/email-confirm');
const { getSellerPhonenumberConfirm } = require('../models/phonenumber-confirm');
const { createPersonal } = require('../ethereum/personal');
const _ = require('lodash');
const { createLock, getLock } = require('../models/lock');
const { getSellEthCode } = require('../models/sell-eth');
const auth = require('../middleware/auth');
const { createSforgot, getSforgot, useSforgot } = require('../models/sforgot');
const axios = require('axios');
const { getPsforgot, usePsforgot } = require('../models/psforgot');
router.post('/create', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        code: Joi.string().required(),
        phonenumber: Joi.string().required(),
        password: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const sellEth = await getSellEthCode(req.body.code);
    if(!sellEth.isPayed) return res.status(400).send('U moet nog eerst betalen voor u kunt registeren');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const ethereumPassword = cryptoRandomString({ length: 256 });
    const email = await getSellerEmailFromCode(req.body.code);
    const phonenumberConfirm = await getSellerPhonenumberConfirm(req.body.phonenumber);
    if(!phonenumberConfirm.isConfirmed) return res.status(400).send('Telefoonnummer is niet bevestigd');
    createPersonal(ethereumPassword).then(async ethereumAddress => {
        const seller = await createSeller(email, req.body.phonenumber, hashedPassword, ethereumAddress, ethereumPassword);
        const token = seller.generateAuthToken();
        return res.header('x-auth-token', token).send(seller._id);
    })
}));
router.post('/login', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email;
    const lock = await getLock(email);
    if(lock != null && lock.attempts > 3 && lock.date > new Date()) return res.status(400).send('Deze e-mail is op slot voor 30 minuten'); 
    const seller = await getSeller(email);
    if(seller == null) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    }
    const validPasssword = await bcrypt.compare(req.body.password, seller.password);
    if(!validPasssword) {
        await createLock(email);
        return res.status(400).send('Ongeldig e-mail of wachtwoord');
    } 
    const token = seller.generateAuthToken();
    return res.header('x-auth-token', token).send(seller._id);
}));
router.get('/count', asyncMiddle(async (req, res) => {
    const countLength = await count();
    return res.send({ count: countLength });
}));
router.get('/tx-fee', auth, asyncMiddle(async (req, res) => {
    const seller = await getSellerId(req.user._id);
    return res.send(_.pick(seller, ['txFee']));
}))
router.post('/tx-fee/:txFee', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.txFee, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await updateSellerTxFee(req.user._id, req.params.txFee);
    return res.send()
}))
router.post('/forgot', asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const email = req.body.email.toLowerCase().trim();;
    const code = cryptoRandomString({ length: 256 });
    const seller = await getSellerEmail(email);
    await createSforgot(code, seller._id);
    console.log(code);
    // axios.post('https://presale.discount/email/reset', {
    //     mail: email,
    //     link: 'https://sell.presale.discount/reset/' + random 
    // }).then(rs => res.send()).catch(err => res.status(500).send(err.message));
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
    const sforgot = await getSforgot(code);
    if(sforgot == null) return res.status(400).send('oeps er ging iets mis');
    console.log(sforgot.isUsed);
    if(sforgot.isUsed) return res.status(400).send();
    console.log('gothet');
    if(!sforgot.isConfirmed) return res.status(400).send('oeps er ging iets mis');
    const psforgot = await getPsforgot(verificationCode, secret);
    if(psforgot == null) return res.status(400).send('oeps er ging iets mis');
    if(psforgot.isUsed) return res.status(400).send('Het wachtwoord voor deze code is al aangepast');
    if(!psforgot.isConfirmed) return res.status(400).send('Oeps er ging iets mis');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await updatePassword(sforgot.selller, hashedPassword);
    await useSforgot(code);
    await usePsforgot(verificationCode, secret);
    return res.send();
}));
module.exports = router;