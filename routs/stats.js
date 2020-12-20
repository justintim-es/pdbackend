const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStat } = require('../models/stat');
const asyncMiddle = require('../middleware/async');
const _ = require('lodash');
router.get('/', auth, asyncMiddle(async (req, res) => {
    const stat = await getStat(req.user._id);
    return res.send(_.pick(stat, ['packages', 'transactions']))
}));


module.exports = router;