var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var dbman = require('../services/dbman');
var sendPasswordResetMail = require('../services/email').sendPasswordResetMail;
var TOKEN_SECRET = require('../services/secman').TOKEN_SECRET;
var sendPushNotifications = require('../services/notification.service').sendPushNotifications;
var tsgConnectionService = require('../services/tsg-connection.service');
var path = require('path');
var goodreadsConnectionService = require('../services/goodreads-connection-service');
var ONE_YEAR = '8760h';
router.get('/data', function (req, res) {
    var username = req.body.username;
    try {
        dbman.findUser(username, function (user) {
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
router.post('/login', function (req, res, next) {
    var _a = req.body, username = _a.username, password = _a.password;
    try {
        dbman.findUser(username, function (user) {
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
router.post('/register', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var user, posUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.body;
                if (!validUser(user)) {
                    res.status(200).send({ status: 1, error: 'invalid user data' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, dbman.findUserAsync(user.username)];
            case 1:
                posUser = _a.sent();
                if (posUser) {
                    res.status(200).send({ status: 2, error: 'user already exists' });
                    return [2 /*return*/];
                }
                try {
                    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
                    dbman.createUser(user, function (result) {
                        var token = authenticateUser(user.username);
                        user = sanitize(user);
                        user.access_token = token;
                        res.status(200).send(user);
                    });
                }
                catch (error) {
                    res.send({ status: 0, error: error });
                }
                return [2 /*return*/];
        }
    });
}); });
router.post('/save', function (req, res, next) {
    var userdata = req.body;
    try {
        dbman.updateUser(userdata, function (result) {
            res.send(true);
        });
    }
    catch (error) {
        console.error('An error occurred trying to save a user: ', error);
        res.send(false);
    }
});
router.post('/requestPasswordReset', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var username, posUser, hash, result;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                return [4 /*yield*/, dbman.findUserAsync(username)];
            case 1:
                posUser = _a.sent();
                if (!posUser) {
                    res.status(200).send({ status: 1, message: 'user doesnt exists' });
                    return [2 /*return*/];
                }
                hash = '';
                _a.label = 2;
            case 2:
                hash = crypto.randomBytes(20).toString('hex');
                _a.label = 3;
            case 3: return [4 /*yield*/, dbman.findUserByHashAsync(hash)];
            case 4:
                if (_a.sent()) return [3 /*break*/, 2];
                _a.label = 5;
            case 5: return [4 /*yield*/, dbman.updateUserAsync({ username: username, passwordResetHash: hash })];
            case 6:
                _a.sent();
                return [4 /*yield*/, sendPasswordResetMail(posUser.email, hash)];
            case 7:
                result = _a.sent();
                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                    var user;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, dbman.findUserAsync(username)];
                            case 1:
                                user = _a.sent();
                                if (user.passwordResetHash == hash) {
                                    try {
                                        dbman.updateUserAsync({ username: username, passwordResetHash: '' });
                                    }
                                    catch (error) {
                                        console.error('An error occurred trying to save a user: ', error);
                                    }
                                }
                                return [2 /*return*/];
                        }
                    });
                }); }, 900000); // 15 Minutes = 900000 Milliseconds
                res.status(200).send({ email: sanitizeEmail(posUser.email), status: 0, message: 'password reset process started' });
                return [2 /*return*/];
        }
    });
}); });
router.post('/resetPassword', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var resetData, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resetData = req.body;
                return [4 /*yield*/, dbman.findUserAsync(resetData.username)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(200).send({ status: 1, message: 'user doesnt exists' });
                    return [2 /*return*/];
                }
                try {
                    resetData.password = bcrypt.hashSync(resetData.password, bcrypt.genSaltSync(10));
                    dbman.updateUser(resetData, function (result) {
                        res.status(200).send({ status: 0, message: 'password saved successfully' });
                    });
                }
                catch (error) {
                    console.error('An error occurred trying to save a user: ', error);
                    res.status(200).send({ status: 1, message: 'couldnt save new password' });
                }
                return [2 /*return*/];
        }
    });
}); });
router.post('/validateResetHash', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var hash, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = req.body.passwordResetHash;
                return [4 /*yield*/, dbman.findUserByHashAsync(hash)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(200).send({ status: 1, message: 'invalid hash' });
                    return [2 /*return*/];
                }
                res.status(200).send({ username: user.username, status: 0, message: 'hash valid' });
                return [2 /*return*/];
        }
    });
}); });
router.post('/share', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var username, contactName, book, notificationData, user, sharedBook;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                contactName = req.body.contact;
                book = req.body.book;
                notificationData = req.body.notificationData;
                return [4 /*yield*/, dbman.findUserAsync(username)];
            case 1:
                user = _a.sent();
                sharedBook = { editionId: book.edition_id, title: book.title, md5: book.md5, author: book.author,
                    language: book.language, coverUrl: book.cover_url, isbn: book.isbn, filename: book.filename };
                console.log(sharedBook);
                if (user) {
                    user.contacts.forEach(function (contact) { return __awaiter(_this, void 0, void 0, function () {
                        var dbContact_1;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(contact.name == contactName)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, dbman.findUserAsync(contactName)];
                                case 1:
                                    dbContact_1 = _a.sent();
                                    if (dbContact_1) {
                                        dbContact_1.contacts.forEach(function (_contact) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!(_contact.name == username)) return [3 /*break*/, 3];
                                                        _contact.sharedBooks.push(sharedBook);
                                                        _contact.unreadMessages = ++_contact.unreadMessages || 1;
                                                        return [4 /*yield*/, dbman.updateUserAsync(dbContact_1)];
                                                    case 1:
                                                        _a.sent();
                                                        return [4 /*yield*/, sendPushNotifications(dbContact_1.pushSubscriptions, notificationData.title, notificationData.message, notificationData.actions, book)];
                                                    case 2:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                    }
                                    return [2 /*return*/];
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                res.status(200).send({ status: 0, message: '' });
                return [2 /*return*/];
        }
    });
}); });
router.get('/shared', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var username, contactName, data, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                contactName = req.query.contact;
                data = [];
                return [4 /*yield*/, dbman.findUserAsync(username)];
            case 1:
                user = _a.sent();
                if (user) {
                    user.contacts.forEach(function (contact) {
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
                return [2 /*return*/];
        }
    });
}); });
router.post('/friend-request/send', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var username, contactUsername, notificationData, user, contact;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                contactUsername = req.body.contactUsername;
                notificationData = req.body.notificationData;
                return [4 /*yield*/, dbman.findUserAsync(username)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(200).send({ status: 1, message: 'user does not exist' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, dbman.findUserAsync(contactUsername)];
            case 2:
                contact = _a.sent();
                if (!contact) {
                    res.status(200).send({ status: 2, message: 'contact does not exist' });
                    return [2 /*return*/];
                }
                contact.friendRequests.push(username);
                return [4 /*yield*/, dbman.updateUserAsync(contact)];
            case 3:
                _a.sent();
                return [4 /*yield*/, sendPushNotifications(contact.pushSubscriptions, notificationData.title, notificationData.message, notificationData.actions)];
            case 4:
                _a.sent();
                res.status(200).send({ status: 0, message: '' });
                return [2 /*return*/];
        }
    });
}); });
router.post('/friend-request/accept', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var username, contactUsername, notificationData, user, contact;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = req.body.username;
                contactUsername = req.body.contactUsername;
                notificationData = req.body.notificationData;
                return [4 /*yield*/, dbman.findUserAsync(username)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(200).send({ status: 1, message: 'user does not exist' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, dbman.findUserAsync(contactUsername)];
            case 2:
                contact = _a.sent();
                if (!contact) {
                    res.status(200).send({ status: 2, message: 'contact does not exist' });
                    return [2 /*return*/];
                }
                contact.contacts.push({ name: username });
                user.contacts.push({ name: contactUsername });
                return [4 /*yield*/, dbman.updateUserAsync(contact)];
            case 3:
                _a.sent();
                return [4 /*yield*/, dbman.updateUserAsync(user)];
            case 4:
                _a.sent();
                return [4 /*yield*/, sendPushNotifications(contact.pushSubscriptions, notificationData.title, notificationData.message, notificationData.actions)];
            case 5:
                _a.sent();
                res.status(200).send({ status: 0, message: '' });
                return [2 /*return*/];
        }
    });
}); });
router.post('/connect-book-site', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var connection, value, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                switch (req.body.connectionType) {
                    case 'TSG':
                        connection = tsgConnectionService;
                        break;
                    case 'GR':
                        connection = goodreadsConnectionService;
                        break;
                    default:
                        res.status(200).send({ status: 1, message: 'invalid connection type' });
                        return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                value = void 0;
                if (!req.body.email || !req.body.password) {
                    res.status(200).send({ status: 1, error: 'missing credentials' });
                    return [2 /*return*/];
                    //value = await connection.getBooksToRead(req.body.username);
                }
                return [4 /*yield*/, connection.getBooksToRead(req.body.email, req.body.password, req.body.username)];
            case 2:
                value = _a.sent();
                if (value.status == 0) {
                }
                res.status(200).send(value);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error(error_1);
                res.status(200).send({ status: 1, error: error_1 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
function authenticateUser(username) {
    return jwt.sign({ username: username }, TOKEN_SECRET, { expiresIn: ONE_YEAR });
}
function sanitize(user) {
    user = Object.fromEntries(Object.entries(user).filter(function (_a) {
        var key = _a[0], value = _a[1];
        return key != 'password' && !key.startsWith('_');
    }));
    if (user.eReaderDeviceId && user.eReaderDeviceId.length > 4) {
        user.eReaderDeviceId = "*****".concat(user.eReaderDeviceId.slice(-4));
    }
    if (user.eReaderRefreshToken) {
        user.eReaderRefreshToken = '**********';
    }
    return user;
}
function sanitizeEmail(email) {
    return "".concat(email.charAt(0), "*****").concat(email.substr(email.lastIndexOf('@')));
}
function validUser(user) {
    return Boolean(user.username && user.email && user.password);
}
module.exports = router;
