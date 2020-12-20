const passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema
.is().min(8)                                    
.is().max(20)                                  
.has().uppercase()                              
.has().lowercase()                              
.has().digits()
.has().symbols()                                 
.has().not().spaces()                         
const express = require('express'); 
const router = express.Router();
const Joi = require('joi');
const asyncMiddle = require('../middleware/async');
router.post('/validate', asyncMiddle((req, res) => {
    const result = Joi.validate(req.body, {
        password: Joi.string().required()
    });
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const password = req.body.password;
    const validateResult = schema.validate(password);
    if(validateResult) return res.send();
    const pwError = schema.validate(password, { list: true })[0];
    if(pwError == 'min') {
        return res.status(400).send('Wachtwoorden hebben 6 letters nodig')
    } else if (pwError == 'max') {
        return res.status(400).send("Wachtwoorden mogen niet langer zijn dan 20 letters");
    } else if (pwError == 'symbols') {
        return res.status(400).send('Wachtwoorden hebben 1 symbool nodig');
    } else if (pwError == 'digits') {
        return res.status(400).send('Wachtwoorden hebben 1 cijfer nodig');
    } else if (pwError == 'uppercase') {
        return res.status(400).send('Wachtwoorden hebben 1 kleine letter nodig');
    } else if (pwError == 'lowercase') {
        return res.status(400).send('Wachtwoordem hebben 1 hoodletter nodig');
    } else {
        return res.status(400).send('Ongeldig wachtwoord')
    }
}));
module.exports = router;