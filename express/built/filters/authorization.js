var jwt = require('jsonwebtoken');
var TOKEN_SECRET = require('../services/secman').TOKEN_SECRET;
var BEARER = 'Bearer ';
module.exports = function authorizeUser(req, res, next) {
    try {
        var authHeader = req.header('Authorization');
        if (authHeader && authHeader.startsWith(BEARER)) {
            var token = authHeader.split(BEARER)[1];
            if (token != null) {
                var result = jwt.verify(token, TOKEN_SECRET, function (err, user) {
                    if (user) {
                        req.body.username = user.username;
                        return true;
                    }
                    return false;
                });
                if (result)
                    return next();
            }
        }
        res.status(401).send('Unauthorized');
    }
    catch (err) {
        console.error('error while authorizing: ' + err);
        res.status(403).send('Error while authorizing');
    }
};
