const axios = require('axios');
const urlEur = 'https://api.exchangeratesapi.io/latest?base=USD&symbols=EUR';
const urlDollar = 'https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD';

const eur = () => {
    return new Promise((resolve, reject) => {
        axios.get(urlEur).then(resolve).catch(reject)
    })
} 
const dollar = () => {
    return new Promise((resolve, reject) => {
        axios.get(urlDollar).then(resolve).catch(reject)
    })
}
module.exports.eur = eur;
module.exports.dollar = dollar;