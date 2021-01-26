const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { getPayments } = require('../models/payment');
const _ = require('lodash');
router.get('/payments/:package', async (req, res) => {
    const result = Joi.validate(req.params.package, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const payments = await getPayments(req.params.package);
    const mapped = _.map(payments, payment => _.pick(payment, ['date', '_id']));
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
});
module.exports = router;