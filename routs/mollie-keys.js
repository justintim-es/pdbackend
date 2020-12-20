const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/auth-admin');
const asyncMiddle = require('../middleware/async');
const Joi = require('joi');
const { createMollieKey } = require('../models/mollie-key');
router.post('/create', authAdmin, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.body, {
        account: Joi.string().required(),
        key: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await createMollieKey(req.body.account, req.body.key);
    return res.send();
}));
module.exports = router;