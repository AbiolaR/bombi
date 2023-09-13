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


const ONE_YEAR = '8760h';

router.get('/data', (req, res) => {
    const username = req.body.username;

    try {
        dbman.findUser(username, (user) => {
            if (!user) {
                res.status(200).send({status: 3, error: 'user doesnt exist'});
                return;
            } else {
                res.status(200).send(sanitize(user._doc));
            }
        })
    } catch (error) {
        res.send({status: 0, error: error});
    }
});

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

    if (!validUser(user)) {
        res.status(200).send({status: 1, error: 'invalid user data'});
        return;
    }

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
        res.status(200).send({status: 1, message: 'user doesnt exists'});
        return;
    }

    let hash = '';
    do {
        hash = crypto.randomBytes(20).toString('hex');
    } while (await dbman.findUserByHashAsync(hash));
    await dbman.updateUserAsync({username: username, passwordResetHash: hash});
    const result = await sendPasswordResetMail(posUser.email, hash);
    setTimeout(async () => {
        let user = await dbman.findUserAsync(username);
        if (user.passwordResetHash == hash) {
            try {
                dbman.updateUserAsync({username: username, passwordResetHash: ''});
            } catch (error) {
                console.error('An error occurred trying to save a user: ', error);
            }
        }
    }, 900000) // 15 Minutes = 900000 Milliseconds

    res.status(200).send({email: sanitizeEmail(posUser.email) ,status: 0, message: 'password reset process started'});
});

router.post('/resetPassword', async (req, res, next) => {
    let resetData = req.body;

    let user = await dbman.findUserAsync(resetData.username);

    if (!user) {
        res.status(200).send({status: 1, message: 'user doesnt exists'});
        return;
    }

    try {
        resetData.password = bcrypt.hashSync(resetData.password, bcrypt.genSaltSync(10));
        dbman.updateUser(resetData, (result) => {
            res.status(200).send({status: 0, message: 'password saved successfully'});
        })
    } catch (error) {
        console.error('An error occurred trying to save a user: ', error);
        res.status(200).send({status: 1, message: 'couldnt save new password'});
    }
});

router.post('/validateResetHash', async (req, res, next) => {
    const hash = req.body.passwordResetHash;

    const user = await dbman.findUserByHashAsync(hash);

    if (!user) {
        res.status(200).send({status: 1, message: 'invalid hash'});
        return;
    }

    res.status(200).send({username: user.username ,status: 0, message: 'hash valid'});
});

router.post('/share', async (req, res) => {
    const username = req.body.username;
    const contactName = req.body.contact;
    const book = req.body.book;
    const notificationData = req.body.notificationData;
    const user = await dbman.findUserAsync(username);
    const sharedBook = { editionId: book.edition_id, title: book.title, md5: book.md5, author: book.author,
    language: book.language, coverUrl: book.cover_url, isbn: book.isbn, filename: book.filename };
    console.log(sharedBook)
    
    if (user) {
        user.contacts.forEach(async contact => {
            if (contact.name == contactName) {
                const dbContact = await dbman.findUserAsync(contactName);
                if (dbContact) {
                    dbContact.contacts.forEach(async _contact => {
                        if (_contact.name == username) {
                            _contact.sharedBooks.push(sharedBook);
                            _contact.unreadMessages = ++_contact.unreadMessages || 1;
                            await dbman.updateUserAsync(dbContact);
                            await sendPushNotifications(dbContact.pushSubscriptions, 
                                notificationData.title, notificationData.message, notificationData.actions, book);
                            return;
                        }
                    });
                }
                return;
            }
        });
    }

    res.status(200).send({ status: 0, message: ''});
});

router.get('/shared', async (req, res) => {
    const username = req.body.username;
    const contactName = req.query.contact;

    let data = [];

    const user = await dbman.findUserAsync(username);
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
});

router.post('/friend-request/send', async (req, res) => {
    const username = req.body.username;
    const contactUsername = req.body.contactUsername;
    const notificationData = req.body.notificationData;

    const user = await dbman.findUserAsync(username);
    if (!user) {
        res.status(200).send({status: 1, message: 'user does not exist'});
        return;
    }

    const contact = await dbman.findUserAsync(contactUsername);
    if (!contact) {
        res.status(200).send({status: 2, message: 'contact does not exist'});
        return;
    }

    contact.friendRequests.push(username);
    await dbman.updateUserAsync(contact);
    await sendPushNotifications(contact.pushSubscriptions, 
        notificationData.title, notificationData.message, notificationData.actions);

    res.status(200).send({status: 0, message: ''});
});

router.post('/friend-request/accept', async (req, res) => {
    const username = req.body.username;
    const contactUsername = req.body.contactUsername;
    const notificationData = req.body.notificationData;

    const user = await dbman.findUserAsync(username);
    if (!user) {
        res.status(200).send({status: 1, message: 'user does not exist'});
        return;
    }

    const contact = await dbman.findUserAsync(contactUsername);
    if (!contact) {
        res.status(200).send({status: 2, message: 'contact does not exist'});
        return;
    }

    contact.contacts.push({ name: username });
    user.contacts.push({ name: contactUsername });
    
    await dbman.updateUserAsync(contact);
    await dbman.updateUserAsync(user);
    await sendPushNotifications(contact.pushSubscriptions, 
        notificationData.title, notificationData.message, notificationData.actions);

    res.status(200).send({status: 0, message: ''});
});

router.post('/connect-book-site', async (req, res) => {
    let connection;

    switch(req.body.connectionType) {
        case 'TSG':
            connection = tsgConnectionService;
            break;
        default:
            res.status(200).send({status: 1, message: 'invalid connection type'});
            return;
    }

    try {
        let value;
        if (req.body.email && req.body.password) {
            value = await connection.getBooksToRead(req.body.email, req.body.password, req.body.username);
        } else {
            value = await connection.getBooksToRead(req.body.username);
        }
        res.status(200).send(value)
    } catch (error) {
        console.error(error)
        res.status(200).send({ status: 1, error: error });
    }

    
});

router.get('/testpage', async (req, res) => {
    const options = {
        root: path.join(__dirname)
    };
 
    res.status(200).sendFile('test.html', options)
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

function validUser(user) {
    return Boolean(user.username && user.email && user.password);
}

module.exports = router;