const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send();
    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        if(!decoded.admin) return res.status(401).send();
        next();
    } catch (error) {
        return res.status(400).send('Invalid token')
    }
}