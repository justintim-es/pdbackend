const express = require('express');
const router = express.Router();
const Joi = require('joi');
const cryptoRandomString = require('crypto-random-string');

router.post('/check-email', (req, res) => {
    const result = Joi.validate(req.body, {
        email: Joi.string().required()
    });    
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const random = cryptoRandomString({ length: 64 });
})

module.exports = router;