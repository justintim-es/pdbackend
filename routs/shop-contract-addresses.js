const express = require('express');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const auth = require('../middleware/auth');
const { getTransactionReceipt} = require('../ethereum/eth');
const { createShopContractAddress } = require('../models/shop-contract-address');
const { getShopContractHashAccount } = require('../models/shop-contract-hash');
const { updateContractTwo } = require('../models/account'); 
const Joi = require('joi');
router.get('/', auth, asyncMiddle(async (req, res) => {
    const contractHash = await getShopContractHashAccount(req.user._id);
    getTransactionReceipt(contractHash.contractHash).then(async receipt => {
        if(receipt ? receipt.status : false) {
            await createShopContractAddress(req.user._id, receipt.contractAddress);
            await updateContractTwo(req.user._id);
            return res.send();
        } else return res.status(400).send()
    })
}));
module.exports = router;