const cors = require('cors');
const config = require('config');
const error = require('./middleware/error');
const winston = require('winston');
require('winston-mongodb');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
if(!config.get('mongoConnect')) {
    console.error('fatal error mongoConnect');
    process.exit(0);
}
if (!config.get('jwtPrivateKey')) {
    console.error('fatal error jwtprivatekey');
    process.exit(0);
}
if(!config.get('twilioAccount')) {
    console.error('fatal error twilioAccount');
    process.exit(0);
}
if(!config.get('twilioAuth')) {
    console.error('fatal error twilioAuth');
    process.exit(0);
}
if(!config.get('etherscanApiKey')) {
    console.error('fatal error etherscanApiKey');
    process.exit(0);
}
if(!config.get('web3Connect')) {
    console.error('fatal error web3Connect');
    process.exit(0);
}
winston.add(new winston.transports.MongoDB({ db: config.get('mongoConnect')}));
app.use(express.json());
const mongoose = require('mongoose');
mongoose.connect(
    config.get('mongoConnect')
).then(rs => console.log("succes")).catch(err => console.log(err));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*");
    next();
});
var whitelist = [
    'https://presale.discount', 
    'https://mollie.presale.discount',
    'https://receipts.presale.discount'
];
const corsOptions = {
    exposedHeaders: 'x-auth-token',
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
};
app.use(cors(corsOptions));
const shops = require('./routs/shops');
const mollie = require('./routs/mollie');
const email = require('./routs/email');
const emailConfirm = require('./routs/email-confirm');
const phonenumberConfirm = require('./routs/phonenumber-confirm');
const password = require('./routs/password');
const accounts = require('./routs/accounts');
const subdomain = require('./routs/subdomain');
const packages = require('./routs/packages');
const customer = require('./routs/customer');
const balances = require('./routs/balances');
const poken = require('./routs/poken');
const stats = require('./routs/stats');
const payments = require('./routs/payments');
const paforgot = require('./routs/paforgot');
const pcforgot = require('./routs/pcforgot');
const receipts = require('./routs/receipts');
const mollieKeys = require('./routs/mollie-keys');
const adyen = require('./routs/adyen');
const ethereum = require('./routs/ethereum');
app.use('/api/shops', shops);
app.use('/api/mollie', mollie);
app.use('/api/email', email);
app.use('/api/email-confirm', emailConfirm);
app.use('/api/phonenumber-confirm', phonenumberConfirm);
app.use('/api/password', password);
app.use('/api/accounts', accounts);
app.use('/api/subdomains', subdomain);
app.use('/api/packages', packages);
app.use('/api/customer', customer);
app.use('/api/balances', balances);
app.use('/api/poken', poken);
app.use('/api/stats', stats);
app.use('/api/payments', payments);
app.use('/api/paforgot', paforgot);
app.use('/api/pcforgot', pcforgot);
app.use('/api/receipts', receipts);
app.use('/api/mollie-keys', mollieKeys);
app.use('/api/adyen', adyen);
app.use('/api/ethereum', ethereum);
app.use(error); 
console.log('token', jwt.sign({ admin: true }, config.get('jwtPrivateKey')));

app.listen(5555, () => console.log('listening'));

