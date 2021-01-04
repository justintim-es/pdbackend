const axios = require('axios');
const urlEur = 'https://api.exchangeratesapi.io/latest?base=USD&symbols=EUR';
const urlDollar = 'https://api.exchangeratesapi.io/latest?base=EUR&symbols=USD';

const eur = () => {
    return new Promise((resolve, reject) => {
        axios.get(urlEur).then(resolve).catch(err => {
            throw new Error(err);
        })
    })
} 
const dollar = () => {
    return new Promise((resolve, reject) => {
        axios.get(urlDollar).then(resolve).catch(err => {
            throw new Error(err);
        })
    })
}
module.exports.eur = eur;
module.exports.dollar = dollar;