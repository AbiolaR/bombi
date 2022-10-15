const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../services/secman');

const BEARER = 'Bearer ';

module.exports = function authorizeUser(req, res, next) {
    try {
        const authHeader = req.header('Authorization');
        
        if (authHeader && authHeader.startsWith(BEARER)) {
            var token = authHeader.split(BEARER)[1];
            
            if (token != null) {
                jwt.verify(token, TOKEN_SECRET, (err, user) => {
                    if (user) {
                        next();
                    }
                });
            }
        }
        res.status(401).send('Unauthorized');
    } catch (err) {
        res.status(403).send('Error while authorizing');
    }
}