var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const dbman = require('../services/dbman');
const { sendPasswordResetMail } = require('../services/email');
const { TOKEN_SECRET } = require('../services/secman');
const { sendPushNotifications } = require('../services/notification.service');
const tsgConnectionService = require('../services/tsg-connection.service');
const path = require('path');
const goodreadsConnectionService = require('../services/goodreads-connection-service');
const ONE_YEAR = '8760h';
router.get('/data', (req, res) => {
    const username = req.body.username;
    try {
        dbman.findUser(username, (user) => {
            if (!user) {
                res.status(200).send({ status: 3, error: 'user doesnt exist' });
                return;
            }
            else {
                res.status(200).send(sanitize(user._doc));
            }
        });
    }
    catch (error) {
        res.send({ status: 0, error: error });
    }
});
router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    try {
        dbman.findUser(username, (user) => {
            if (!user) {
                res.status(200).send({ status: 3, error: 'user doesnt exist' });
                return;
            }
            if (bcrypt.compareSync(password, user.password)) {
                var token = authenticateUser(user.username);
                user = sanitize(user._doc);
                user.access_token = token;
                res.status(200).send(user);
            }
            else {
                res.status(200).send({ status: 2, error: 'wrong password' });
            }
        });
    }
    catch (error) {
        res.send({ status: 0, error: error });
    }
});
router.post('/register', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    var user = req.body;
    if (!validUser(user)) {
        res.status(200).send({ status: 1, error: 'invalid user data' });
        return;
    }
    const posUser = yield dbman.findUserAsync(user.username);
    if (posUser) {
        res.status(200).send({ status: 2, error: 'user already exists' });
        return;
    }
    try {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        dbman.createUser(user, (result) => {
            var token = authenticateUser(user.username);
            user = sanitize(user);
            user.access_token = token;
            res.status(200).send(user);
        });
    }
    catch (error) {
        res.send({ status: 0, error: error });
    }
}));
router.post('/save', (req, res, next) => {
    const userdata = req.body;
    try {
        dbman.updateUser(userdata, (result) => {
            res.send(true);
        });
    }
    catch (error) {
        console.error('An error occurred trying to save a user: ', error);
        res.send(false);
    }
});
router.post('/requestPasswordReset', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const username = req.body.username;
    const posUser = yield dbman.findUserAsync(username);
    if (!posUser) {
        res.status(200).send({ status: 1, message: 'user doesnt exists' });
        return;
    }
    let hash = '';
    do {
        hash = crypto.randomBytes(20).toString('hex');
    } while (yield dbman.findUserByHashAsync(hash));
    yield dbman.updateUserAsync({ username: username, passwordResetHash: hash });
    const result = yield sendPasswordResetMail(posUser.email, hash);
    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        let user = yield dbman.findUserAsync(username);
        if (user.passwordResetHash == hash) {
            try {
                dbman.updateUserAsync({ username: username, passwordResetHash: '' });
            }
            catch (error) {
                console.error('An error occurred trying to save a user: ', error);
            }
        }
    }), 900000); // 15 Minutes = 900000 Milliseconds
    res.status(200).send({ email: sanitizeEmail(posUser.email), status: 0, message: 'password reset process started' });
}));
router.post('/resetPassword', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let resetData = req.body;
    let user = yield dbman.findUserAsync(resetData.username);
    if (!user) {
        res.status(200).send({ status: 1, message: 'user doesnt exists' });
        return;
    }
    try {
        resetData.password = bcrypt.hashSync(resetData.password, bcrypt.genSaltSync(10));
        dbman.updateUser(resetData, (result) => {
            res.status(200).send({ status: 0, message: 'password saved successfully' });
        });
    }
    catch (error) {
        console.error('An error occurred trying to save a user: ', error);
        res.status(200).send({ status: 1, message: 'couldnt save new password' });
    }
}));
router.post('/validateResetHash', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const hash = req.body.passwordResetHash;
    const user = yield dbman.findUserByHashAsync(hash);
    if (!user) {
        res.status(200).send({ status: 1, message: 'invalid hash' });
        return;
    }
    res.status(200).send({ username: user.username, status: 0, message: 'hash valid' });
}));
router.post('/share', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const username = req.body.username;
    const contactName = req.body.contact;
    const book = req.body.book;
    const notificationData = req.body.notificationData;
    const user = yield dbman.findUserAsync(username);
    const sharedBook = { editionId: book.edition_id, title: book.title, md5: book.md5, author: book.author,
        language: book.language, coverUrl: book.cover_url, isbn: book.isbn, filename: book.filename };
    console.log(sharedBook);
    if (user) {
        user.contacts.forEach((contact) => __awaiter(this, void 0, void 0, function* () {
            if (contact.name == contactName) {
                const dbContact = yield dbman.findUserAsync(contactName);
                if (dbContact) {
                    dbContact.contacts.forEach((_contact) => __awaiter(this, void 0, void 0, function* () {
                        if (_contact.name == username) {
                            _contact.sharedBooks.push(sharedBook);
                            _contact.unreadMessages = ++_contact.unreadMessages || 1;
                            yield dbman.updateUserAsync(dbContact);
                            yield sendPushNotifications(dbContact.pushSubscriptions, notificationData.title, notificationData.message, notificationData.actions, book);
                            return;
                        }
                    }));
                }
                return;
            }
        }));
    }
    res.status(200).send({ status: 0, message: '' });
}));
router.get('/shared', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const username = req.body.username;
    const contactName = req.query.contact;
    let data = [];
    const user = yield dbman.findUserAsync(username);
    if (user) {
        user.contacts.forEach(contact => {
            if (contactName) {
                if (contactName == contact.name) {
                    data = contact.sharedBooks;
                    return;
                }
            }
            else if (contact.sharedBooks.length > 0) {
                data.push(contact);
            }
        });
    }
    res.status(200).send({ status: 0, message: '', data: data });
}));
router.post('/friend-request/send', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const username = req.body.username;
    const contactUsername = req.body.contactUsername;
    const notificationData = req.body.notificationData;
    const user = yield dbman.findUserAsync(username);
    if (!user) {
        res.status(200).send({ status: 1, message: 'user does not exist' });
        return;
    }
    const contact = yield dbman.findUserAsync(contactUsername);
    if (!contact) {
        res.status(200).send({ status: 2, message: 'contact does not exist' });
        return;
    }
    contact.friendRequests.push(username);
    yield dbman.updateUserAsync(contact);
    yield sendPushNotifications(contact.pushSubscriptions, notificationData.title, notificationData.message, notificationData.actions);
    res.status(200).send({ status: 0, message: '' });
}));
router.post('/friend-request/accept', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const username = req.body.username;
    const contactUsername = req.body.contactUsername;
    const notificationData = req.body.notificationData;
    const user = yield dbman.findUserAsync(username);
    if (!user) {
        res.status(200).send({ status: 1, message: 'user does not exist' });
        return;
    }
    const contact = yield dbman.findUserAsync(contactUsername);
    if (!contact) {
        res.status(200).send({ status: 2, message: 'contact does not exist' });
        return;
    }
    contact.contacts.push({ name: username });
    user.contacts.push({ name: contactUsername });
    yield dbman.updateUserAsync(contact);
    yield dbman.updateUserAsync(user);
    yield sendPushNotifications(contact.pushSubscriptions, notificationData.title, notificationData.message, notificationData.actions);
    res.status(200).send({ status: 0, message: '' });
}));
router.post('/connect-book-site', (req, res) => __awaiter(this, void 0, void 0, function* () {
    let connection;
    switch (req.body.connectionType) {
        case 'TSG':
            connection = tsgConnectionService;
            break;
        case 'GR':
            connection = goodreadsConnectionService;
            break;
        default:
            res.status(200).send({ status: 1, message: 'invalid connection type' });
            return;
    }
    try {
        let value;
        if (!req.body.email || !req.body.password) {
            res.status(200).send({ status: 1, error: 'missing credentials' });
            return;
            //value = await connection.getBooksToRead(req.body.username);
        }
        value = yield connection.getBooksToRead(req.body.email, req.body.password, req.body.username);
        if (value.status == 0) {
        }
        res.status(200).send(value);
    }
    catch (error) {
        console.error(error);
        res.status(200).send({ status: 1, error: error });
    }
}));
function authenticateUser(username) {
    return jwt.sign({ username: username }, TOKEN_SECRET, { expiresIn: ONE_YEAR });
}
function sanitize(user) {
    user = Object.fromEntries(Object.entries(user).filter(([key, value]) => key != 'password' && !key.startsWith('_')));
    if (user.eReaderDeviceId && user.eReaderDeviceId.length > 4) {
        user.eReaderDeviceId = `*****${user.eReaderDeviceId.slice(-4)}`;
    }
    if (user.eReaderRefreshToken) {
        user.eReaderRefreshToken = '**********';
    }
    return user;
}
function sanitizeEmail(email) {
    return `${email.charAt(0)}*****${email.substr(email.lastIndexOf('@'))}`;
}
function validUser(user) {
    return Boolean(user.username && user.email && user.password);
}
module.exports = router;
