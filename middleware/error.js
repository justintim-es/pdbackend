const winston = require('winston');

module.exports = function(err, req, res, next) {
    console.log(err);
    winston.error(err);
    return res.status(500).send(err);
}