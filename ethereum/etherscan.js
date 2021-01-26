const config = require('config');
const apiKey = config.get('etherscanApiKey');
const url = 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey=' + '5CEN81J488XEST13BZS3N67RI5N37X879V';
const estimatedUrlStart = 'https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice='; 
const estimatedUrlEnd = '&apikey=' + apiKey;
const axios = require('axios');
const price = () => {
    return new Promise((resolve, reject) => {
        axios.get(url).then(resolve).catch(err => {
            throw new Error(err);
        })
    })
}
const estimated  = (gp) => {
    return new Promise((resolve, reject) => {
        axios.get(estimatedUrlStart + gp + estimatedUrlEnd).then(resolve).catch(err => {
            throw new Error(err);
        })
    })
}
module.exports.price = price;
module.exports.estimated = estimated;