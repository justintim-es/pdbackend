const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const asyncMiddle = require('../middleware/async');
const { getSellReceipts, getSellReceiptsSellerPayoutHash } = require('../models/sell-receipt');
const { getTransaction } = require('../ethereum/eth');
const _ = require('lodash');
router.get('/to-contract-pending', auth, asyncMiddle(async (req, res) => {
    const earneds = await getSellReceipts(req.user._id);
    const pendings = [];
    for(let i = 0; i < earneds.length; i++) {
        await getTransaction(earneds[i].hash).then(traschan => {
            if(traschan.blockNumber == null) pendings.push(earneds[i]);
        })
    }
    const mapped = _.map(pendings, pending => _.pick(pending, ['hash', 'eur', 'wei', 'eth', 'date']))
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}));
router.get('/to-contract-finished', auth, asyncMiddle(async (req, res) => {
    const earneds = await getSellReceipts(req.user._id);
    const finisheds = [];
    for(let i = 0; i < earneds.length; i++) {
        await getTransaction(earneds[i].hash).then(traschan => {
            if(traschan.blockNumber != null) finisheds.push(earneds[i]);
        })
    }
    const mapped = _.map(finisheds, finished => _.pick(finished, ['hash', 'eur', 'wei', 'eth', 'date', 'payoutHash']))
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}));
router.get('/from-contract-pending', auth, asyncMiddle(async (req, res) => {
    const earneds = await getSellReceiptsSellerPayoutHash(req.user._id);
    console.log()
    const pendings = [];
    for(let i = 0; i < earneds.length; i++) {
        await getTransaction(earneds[i].payoutHash).then(traschan => {
            if(traschan.blockNumber == null) pendings.push(earneds[i]);
        })
    }
    const mapped = _.map(pendings, pending => _.pick(pending, ['hash', 'eur', 'wei', 'eth', 'date', 'payoutHash']))
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}));
router.get('/from-contract-finished', auth, asyncMiddle(async (req, res) => {
    const earneds = await getSellReceiptsSellerPayoutHash(req.user._id);
    const pendings = [];
    for(let i = 0; i < earneds.length; i++) {
        await getTransaction(earneds[i].payoutHash).then(traschan => {
            if(traschan.blockNumber != null) pendings.push(earneds[i]);
        })
    }
    const mapped = _.map(pendings, pending => _.pick(pending, ['hash', 'eur', 'wei', 'eth', 'date', 'payoutHash']))
    return res.send(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
    );
}));
module.exports = router;