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
                user = sanitize(user._doc);
                user.access_token = token;
                res.status(200).send(user);
            } else {
                res.status(200).send({status: 2, error: 'wrong password'});
            }
        });
    } catch (error) {
        res.send({status: 0, error: error});
    }    

});

router.post('/register', async (req, res, next) => {
    var user = req.body;

    const posUser = await dbman.findUserAsync(user.username);

    if (posUser) {
        res.status(200).send({status: 2, error: 'user already exists'});
        return;
    }

    try {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        dbman.createUser(user, (result) => {
            var token = authenticateUser(user.username);
            user = sanitize(user);
            user.access_token = token;
            res.status(200).send(user);
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

router.post('/requestPasswordReset', async (req, res, next) => {
    const username = req.body.username;

    const posUser = await dbman.findUserAsync(username);

    if (!posUser) {
        res.status(200).send({status: 1, error: 'user doesnt exists'});
        return;
    }

    res.status(200).send({email: sanitizeEmail(posUser.email) ,status: 0, message: 'password reset process started'});
});

function authenticateUser(username) {
    return jwt.sign({ username: username }, TOKEN_SECRET, { expiresIn: ONE_YEAR });
}

function sanitize(user) {
    user = Object.fromEntries(Object.entries(user).filter(([key, value]) => key != 'password' && !key.startsWith('_')));
    if (user.eReaderDeviceId && user.eReaderDeviceId.length > 4) {
        user.eReaderDeviceId = `*****${user.eReaderDeviceId.slice(-4)}`
    }
    if (user.eReaderRefreshToken) {
        user.eReaderRefreshToken = '**********';
    }
    return user;
}

function sanitizeEmail(email) {
    return `${email.charAt(0)}*****${email.substr(email.lastIndexOf('@'))}`
}

module.exports = router;