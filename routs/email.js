const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { createEmail } = require('../models/Email');
const asyncMiddle = require('../middleware/async');
router.post('/', asyncMiddle(async (req, res) => {
    console.log(req.body);
    const result = Joi.validate(req.body, {
        email: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    console.log('email', req.body.email);
    await createEmail(req.body.email);
    return res.send();
}));

module.exports = router;