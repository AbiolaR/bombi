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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BookConnection_instances, _BookConnection_getBooksToReadByUsername, _BookConnection_getBooksToReadByLogin, _BookConnection_getToReadPage, _BookConnection_getBooks;
var jsdom = require('jsdom');
var axios = require('axios');
var dbman = require('../services/dbman');
var chrome = require('selenium-webdriver/chrome');
var _a = require("selenium-webdriver"), By = _a.By, Key = _a.Key, Builder = _a.Builder;
var BookConnection = /** @class */ (function () {
    function BookConnection() {
        _BookConnection_instances.add(this);
        this.BROWSER = 'chrome';
        this.HEADLESS_ARGUMENT = '--headless=new';
        this.NO_SANDBOX_ARGUMENT = '--no-sandbox';
        this.CHROME_BINARY_PATH = '/usr/bin/chromium-browser';
        if (!this.populateBooks ||
            !this.getBookCount) {
            throw new Error('Implementation is missing functions!');
        }
    }
    BookConnection.prototype.validate = function () {
        if (!this.hasOwnProperty('USER_IDENT_PROPERTY') ||
            !this.hasOwnProperty('USER_COOKIES_PROPERTY') ||
            !this.hasOwnProperty('SIGN_IN_URL') ||
            !this.hasOwnProperty('EMAIL_FIELD_ID') ||
            !this.hasOwnProperty('PASSWORD_FIELD_ID') ||
            !this.hasOwnProperty('USER_IDENT_QUERY') ||
            !this.hasOwnProperty('COOKIE_NAMES') ||
            !this.hasOwnProperty('TO_READ_URL') ||
            !this.hasOwnProperty('BOOK_AMOUNT_QUERY') ||
            !this.hasOwnProperty('ALL_BOOKS_QUERY') ||
            !this.hasOwnProperty('ISBN_QUERY') ||
            !this.hasOwnProperty('TITLE_QUERY') ||
            !this.hasOwnProperty('AUTHOR_QUERY') ||
            !this.hasOwnProperty('PUB_DATE_QUERY') ||
            !this.hasOwnProperty('FORMAT_QUERY') ||
            !this.hasOwnProperty('AUDIO_FORMAT') ||
            !this.hasOwnProperty('BOOKS_PER_PAGE') ||
            !this.hasOwnProperty('FIRST_PAGE') ||
            !this.hasOwnProperty('SECOND_PAGE')) {
            throw new Error('Implementation is missing fields!');
        }
        return this;
    };
    BookConnection.prototype.getBooksToRead = function () {
        return __awaiter(this, arguments, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = arguments.length;
                        switch (_a) {
                            case 1: return [3 /*break*/, 1];
                            case 3: return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooksToReadByUsername).call(this, arguments[0])];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooksToReadByLogin).call(this, arguments[0], arguments[1], arguments[2])];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: throw new Error('Invalid number of arguments!');
                }
            });
        });
    };
    BookConnection.prototype.login = function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var headless, prod, driver, options, user_ident, cookies, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headless = true;
                        prod = false;
                        options = new chrome.Options();
                        if (headless) {
                            options.addArguments(this.HEADLESS_ARGUMENT, this.NO_SANDBOX_ARGUMENT);
                            if (prod) {
                                options.setChromeBinaryPath(this.CHROME_BINARY_PATH);
                            }
                        }
                        return [4 /*yield*/, new Builder().forBrowser(this.BROWSER).setChromeOptions(options).build()];
                    case 1:
                        driver = _a.sent();
                        return [4 /*yield*/, driver.get(this.SIGN_IN_URL)];
                    case 2:
                        _a.sent();
                        if (!this.REMEMBER_ME_QUERY) return [3 /*break*/, 4];
                        return [4 /*yield*/, driver.findElement(By.css(this.REMEMBER_ME_QUERY)).sendKeys(Key.SPACE)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, driver.findElement(By.id(this.EMAIL_FIELD_ID)).sendKeys(email)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, driver.findElement(By.id(this.PASSWORD_FIELD_ID)).sendKeys(password, Key.RETURN)];
                    case 6:
                        _a.sent();
                        user_ident = '';
                        cookies = undefined;
                        return [4 /*yield*/, driver.getCurrentUrl()];
                    case 7:
                        if (!((_a.sent()) != this.SIGN_IN_URL)) return [3 /*break*/, 10];
                        return [4 /*yield*/, driver.findElement(By.css(this.USER_IDENT_QUERY)).getAttribute('href')];
                    case 8:
                        user_ident = (_a.sent()).split('/').pop();
                        cookies = [];
                        return [4 /*yield*/, driver.manage().getCookies()];
                    case 9:
                        (_a.sent()).forEach(function (cookie) {
                            if (_this.COOKIE_NAMES.includes(cookie.name)) {
                                cookies.push("".concat(cookie.name, "=").concat(cookie.value));
                            }
                        });
                        _a.label = 10;
                    case 10:
                        result = {
                            user_ident: user_ident,
                            cookies: cookies
                        };
                        return [4 /*yield*/, driver.quit()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    BookConnection.prototype.addPrototype = function (obj) {
        if (!obj.getElementText) {
            obj.getElementText = function (query) {
                return this.querySelector(query).textContent.trim();
            };
        }
    };
    return BookConnection;
}());
_BookConnection_instances = new WeakSet(), _BookConnection_getBooksToReadByUsername = function _BookConnection_getBooksToReadByUsername(username) {
    return __awaiter(this, void 0, void 0, function () {
        var user, doc, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, dbman.findUserAsync(username)];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, { status: 1, error: 'user not found' }];
                    }
                    return [4 /*yield*/, __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getToReadPage).call(this, user[this.USER_IDENT_PROPERTY], user[this.USER_COOKIES_PROPERTY])];
                case 2:
                    doc = _b.sent();
                    this.addPrototype(doc);
                    data = { amount: 0, books: [] };
                    _a = data;
                    return [4 /*yield*/, __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooks).call(this, user[this.USER_IDENT_PROPERTY], user[this.USER_COOKIES_PROPERTY], doc)];
                case 3:
                    _a.books = _b.sent();
                    data.amount = data.books.length;
                    return [2 /*return*/, { status: 0, data: data }];
            }
        });
    });
}, _BookConnection_getBooksToReadByLogin = function _BookConnection_getBooksToReadByLogin(email, password, username) {
    return __awaiter(this, void 0, void 0, function () {
        var loginResult;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, this.login(email, password)];
                case 1:
                    loginResult = _b.sent();
                    if (!(loginResult.user_ident && loginResult.cookies)) return [3 /*break*/, 4];
                    return [4 /*yield*/, dbman.updateUserAsync((_a = { username: username }, _a[this.USER_IDENT_PROPERTY] = loginResult.user_ident, _a[this.USER_COOKIES_PROPERTY] = loginResult.cookies, _a))];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooksToReadByUsername).call(this, username)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4: return [2 /*return*/, { status: 2, error: 'error while attempting to log in' }];
            }
        });
    });
}, _BookConnection_getToReadPage = function _BookConnection_getToReadPage(userIdent, cookies) {
    return __awaiter(this, void 0, void 0, function () {
        var config, page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = {
                        method: 'get',
                        url: this.TO_READ_URL.format(userIdent, this.FIRST_PAGE),
                        headers: {
                            Cookie: cookies.join(';')
                        }
                    };
                    return [4 /*yield*/, axios(config)];
                case 1: return [4 /*yield*/, (_a.sent()).data];
                case 2:
                    page = _a.sent();
                    return [2 /*return*/, new jsdom.JSDOM(page).window.document];
            }
        });
    });
}, _BookConnection_getBooks = function _BookConnection_getBooks(userIdent, cookies, doc) {
    return __awaiter(this, void 0, void 0, function () {
        var books, rawBooks, bookAmount, config, pageAmount, i, page, tempDoc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    books = [];
                    rawBooks = Array.from(doc.querySelectorAll(this.ALL_BOOKS_QUERY));
                    this.populateBooks(rawBooks, books);
                    bookAmount = this.getBookCount(doc);
                    if (!(bookAmount > this.BOOKS_PER_PAGE)) return [3 /*break*/, 5];
                    config = {
                        method: 'get',
                        url: this.TO_READ_URL.format(userIdent, this.SECOND_PAGE),
                        headers: {
                            Cookie: cookies.join(';')
                        }
                    };
                    pageAmount = Math.ceil(bookAmount / this.BOOKS_PER_PAGE);
                    i = this.SECOND_PAGE;
                    _a.label = 1;
                case 1:
                    if (!(i <= pageAmount)) return [3 /*break*/, 5];
                    config.url = this.TO_READ_URL.format(userIdent, i);
                    return [4 /*yield*/, axios(config)];
                case 2: return [4 /*yield*/, (_a.sent()).data];
                case 3:
                    page = _a.sent();
                    tempDoc = new jsdom.JSDOM(page).window.document;
                    rawBooks = Array.from(tempDoc.querySelectorAll(this.ALL_BOOKS_QUERY));
                    this.populateBooks(rawBooks, books);
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, books];
            }
        });
    });
};
/*if (!Object.prototype.getElementText) {
    Object.prototype.getElementText = function(query) {
        const window = new jsdom.JSDOM().window;
        if ([window.HTMLDivElement.name, window.Document.name].includes(this.constructor.name)) {
            return this.querySelector(query).textContent.trim()
        }
    };
}*/
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : '';
        });
    };
}
module.exports = BookConnection;
