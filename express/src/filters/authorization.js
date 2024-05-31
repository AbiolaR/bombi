const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../services/secman');

const BEARER = 'Bearer ';

module.exports = authorizeUser = (role) => {
    return (req, res, next) => {
        try {
            const authHeader = req.header('Authorization');

            if (authHeader && authHeader.startsWith(BEARER)) {
                var token = authHeader.split(BEARER)[1];

                if (token != null) {
                    var result = jwt.verify(token, TOKEN_SECRET, (_err, user) => {
                        if (user) {
                            if (role && user.role !== role) {
                                return false;
                            }
                            req.body.username = user.username;
                            return true;
                        }
                        return false;
                    });
                    if (result) return next();
                }
            }
            res.status(401).send('Unauthorized');
        } catch (err) {
            console.error('error while authorizing: ' + err);
            res.status(403).send('Error while authorizing');
        }
    }
}