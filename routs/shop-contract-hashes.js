const express = require('express');
const { deployShopSellerGas, deployShopSeller, redeployShopSeller } = require('../contracts/shop-seller');
const router = express.Router();
const asyncMiddle = require('../middleware/async');
const auth = require('../middleware/auth');
const { findById, updateContractOne } = require('../models/account');
const Joi = require('joi');
const { sendTransaction } = require('../ethereum/personal');
const { address, txGas } = require('../ethereum/constants');
const { toWei, eurToEth } = require('../ethereum/utils');
const { deployShop, deployShopGas, redeployShop } = require('../contracts/shop');
const { createShopContractHash, updateShopContractHash, getShopContractHashAccount } = require('../models/shop-contract-hash');
const { getTransaction } = require('../ethereum/eth');
const { getSeller, getSellerId } = require('../models/seller');
router.post('/create/:fee', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.fee, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const account = await findById(req.user._id);
    if(!account.isSells) {
        eurToEth(4).then(eschetMe => {
            eurToEth(1).then(eschetGas => {
                const gasPriceMe = Math.round(toWei(eschetGas) / txGas) - 1; 
                sendTransaction(account.ethereumAddress, account.ethereumPassword, toWei(eschetMe), address, gasPriceMe).then(hash => {
                    deployShopGas(account.ethereumAddress, account.ethereumPassword).then(gaschas => {
                        eurToEth(req.params.fee).then(eschetContract => {
                            const gasPriceContract = Math.round(toWei(eschetContract) / gaschas);
                            deployShop(account.ethereumAddress, account.ethereumPassword, gaschas, gasPriceContract).then(async contractHash => {
                                await createShopContractHash(account._id, contractHash);
                                await updateContractOne(account._id);
                                return res.send();
                            })
                        })
                    })
                })
            })
        })
    } else {
        const seller = await getSellerId(account.sells);
        deployShopSellerGas(account.ethereumAddress, account.ethereumPassword, seller.ethereumAddress).then(gaschas => {
            eurToEth(req.params.fee).then(eschet => {
                const gp = Math.round(toWei(eschet) / gaschas) - 1;
                deployShopSeller(account.ethereumAddress, account.ethereumPassword, seller.ethereumAddress, gaschas, gp).then(async contractHash => {
                    await createShopContractHash(account._id, contractHash);
                    await updateContractOne(account._id);
                    return res.send();
                })
            })
        })
    }
}));
router.post('/redeploy/:newTxFee', auth, asyncMiddle(async (req, res) => {
    const result = Joi.validate(req.params.newTxFee, Joi.number().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const account = await findById(req.user._id);
    const shopContractHash = await getShopContractHashAccount(account._id);
    if(!account.isSells) {
        getTransaction(shopContractHash.contractHash).then(traschan => {
            deployShopGas(account.ethereumAddress, account.ethereumPassword).then(gaschas => {
                eurToEth(req.params.newTxFee).then(eschet => {
                    const gp = Math.round(toWei(eschet) / gaschas);
                    console.log(traschan.nonce);
                    redeployShop(account.ethereumAddress, account.ethereumPassword, gaschas, gp, traschan.nonce).then(async newContractHash => {
                        await updateShopContractHash(account._id, newContractHash);
                        return res.send();
                    })
                })
            })
        })
    } else {
        const seller = await getSellerId(account.sells)
        getTransaction(shopContractHash.contractHash).then(traschan => {
            deployShopSellerGas(account.ethereumAddress, account.ethereumPassword, seller.ethereumAddress).then(gaschas => {
                eurToEth(req.params.newTxFee).then(eschet => {
                    const gp = Math.round(toWei(eschet) / gaschas) -1;
                    redeployShopSeller(account.ethereumAddress, account.ethereumPassword, seller.ethereumAddress, gaschas, gp, traschan.nonce).then(async newContractHash => {
                        await updateShopContractHash(account._id, newContractHash);
                        return res.send();
                    })
                })
            })
        })
    }
}))
module.exports = router;