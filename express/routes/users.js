const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbman = require('../services/dbman');
const { TOKEN_SECRET } = require('../services/secman');

const ONE_YEAR = '8760h';

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    try {
        dbman.findUser(username, (user) => {
            if (!user) {
                res.send({status: 2, error: 'user doesnt exist'});
                return;
            }
            if (bcrypt.compareSync(password, user.password)) {
                var token = authenticateUser(user.username);
                res.status(200).send({ token: token });
            } else {
                res.send({status: 2, error: 'wrong password'});
            }
        });
    } catch (error) {
        res.send({status: 0, error: error});
    }    

});

router.post('/register', (req, res, next) => {
    const user = req.body.user;

    try {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        dbman.saveUser(user, (result) => {
            var token = authenticateUser(user.username);
            res.status(200).send({ token: token });
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
});

function authenticateUser(username) {
    return jwt.sign({ username: username }, TOKEN_SECRET, { expiresIn: ONE_YEAR });
}

module.exports = router;