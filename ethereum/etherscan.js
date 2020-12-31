const config = require('config');
const url = 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=' + config.get('etherscanApiKey');
const axios = require('axios');
const price = () => {
    return new Promise((resolve, reject) => {
        axios.get(url).then(resolve).catch(reject)
    })
}
module.exports.price = price;