const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const auth = require('../middleware/auth');
const { getReceipts, getPackageReceipts } = require('../models/receipt');
const _ = require('lodash');
const Joi = require('joi');
router.get('/', auth, asyncMiddle(async (req, res) => {
    const receipts = await getReceipts(req.user._id);
    const mapped = _.map(receipts, receipt => _.pick(receipt, ['amount', 'subdomain', 'date']));
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}));
router.get('/package/:package', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.package, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const receipts = await getPackageReceipts(req.user._id, req.params.package);
    const mapped = _.map(receipts, receipt => _.pick(receipt, ['amount', 'subdomain', 'date']));
    return res.send(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)))
}))
module.exports = router;