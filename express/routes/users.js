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
                res.status(200).send({status: 3, error: 'user doesnt exist'});
                return;
            }
            if (bcrypt.compareSync(password, user.password)) {
                var token = authenticateUser(user.username);
                res.status(200).send({ username: user.username,
                                       access_token: token,
                                       eReaderEmail: user.eReaderEmail,
                                       email: user.email, eReader: user.eReader });
            } else {
                res.status(200).send({status: 2, error: 'wrong password'});
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
        dbman.createUser(user, (result) => {
            var token = authenticateUser(user.username);
            res.status(200).send({ token: token });
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
});

router.post('/save', (req, res, next) => {
    const userdata = req.body;

    try {
        dbman.updateUser(userdata, (result) => {
            res.send(true);
        })
    } catch (error) {
        console.error('An error occurred trying to save a user: ', error);
        res.send(false);
    }
});

function authenticateUser(username) {
    return jwt.sign({ username: username }, TOKEN_SECRET, { expiresIn: ONE_YEAR });
}

module.exports = router;