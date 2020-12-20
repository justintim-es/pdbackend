const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { createSubdomain, deleteOutdated } = require('../models/subdomain');
const asyncMiddle = require('../middleware/async');

router.get('/check/:subdomain', asyncMiddle(async (req, res) => {
    console.log(req.get('host'));    
    const result = Joi.validate(req.params.subdomain, Joi.string().required());
    if(result.error) return res.status(400).send(result.error.details[0].message);
    await deleteOutdated();
    await createSubdomain(req.params.subdomain);
    return res.send();
}));
module.exports = router;