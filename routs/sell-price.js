const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const { getPrice } = require('../models/sell-price');
router.get('/', asyncMiddle(async (req, res) => {
    const price = await getPrice();
    return res.send({ price: price.price });
}));;

module.exports = router;