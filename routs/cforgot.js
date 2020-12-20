const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { confirmCforgot } = require('../models/cforgot');
router.post('/confirm/:code', (req, res) => {
    const result = Joi.validate(req.params.code, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await confirmCforgot(req.params.code);
    return res.send();
})
module.exports = router;