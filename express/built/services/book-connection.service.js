var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BookConnection_instances, _BookConnection_getBooksToReadByUsername, _BookConnection_getBooksToReadByLogin, _BookConnection_getToReadPage, _BookConnection_getBooks;
const jsdom = require('jsdom');
const axios = require('axios');
const dbman = require('../services/dbman');
const chrome = require('selenium-webdriver/chrome');
const { By, Key, Builder } = require("selenium-webdriver");
class BookConnection {
    constructor() {
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
    validate() {
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
    }
    getBooksToRead() {
        return __awaiter(this, arguments, void 0, function* () {
            switch (arguments.length) {
                case 1:
                    return yield __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooksToReadByUsername).call(this, arguments[0]);
                case 3:
                    return yield __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooksToReadByLogin).call(this, arguments[0], arguments[1], arguments[2]);
                default:
                    throw new Error('Invalid number of arguments!');
            }
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const headless = true;
            const prod = false;
            let driver;
            //To wait for browser to build and launch properly
            let options = new chrome.Options();
            if (headless) {
                options.addArguments(this.HEADLESS_ARGUMENT, this.NO_SANDBOX_ARGUMENT);
                if (prod) {
                    options.setChromeBinaryPath(this.CHROME_BINARY_PATH);
                }
            }
            driver = yield new Builder().forBrowser(this.BROWSER).setChromeOptions(options).build();
            yield driver.get(this.SIGN_IN_URL);
            if (this.REMEMBER_ME_QUERY) {
                yield driver.findElement(By.css(this.REMEMBER_ME_QUERY)).sendKeys(Key.SPACE);
            }
            yield driver.findElement(By.id(this.EMAIL_FIELD_ID)).sendKeys(email);
            yield driver.findElement(By.id(this.PASSWORD_FIELD_ID)).sendKeys(password, Key.RETURN);
            let user_ident = '';
            let cookies = undefined;
            if ((yield driver.getCurrentUrl()) != this.SIGN_IN_URL) {
                user_ident = (yield driver.findElement(By.css(this.USER_IDENT_QUERY)).getAttribute('href')).split('/').pop();
                cookies = [];
                (yield driver.manage().getCookies()).forEach(cookie => {
                    if (this.COOKIE_NAMES.includes(cookie.name)) {
                        cookies.push(`${cookie.name}=${cookie.value}`);
                    }
                });
            }
            let result = {
                user_ident: user_ident,
                cookies: cookies
            };
            yield driver.quit();
            return result;
        });
    }
    addPrototype(obj) {
        if (!obj.getElementText) {
            obj.getElementText = function (query) {
                return this.querySelector(query).textContent.trim();
            };
        }
    }
}
_BookConnection_instances = new WeakSet(), _BookConnection_getBooksToReadByUsername = function _BookConnection_getBooksToReadByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield dbman.findUserAsync(username);
        if (!user) {
            return { status: 1, error: 'user not found' };
        }
        let doc = yield __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getToReadPage).call(this, user[this.USER_IDENT_PROPERTY], user[this.USER_COOKIES_PROPERTY]);
        this.addPrototype(doc);
        let data = { amount: 0, books: [] };
        data.books = yield __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooks).call(this, user[this.USER_IDENT_PROPERTY], user[this.USER_COOKIES_PROPERTY], doc);
        data.amount = data.books.length;
        return { status: 0, data: data };
    });
}, _BookConnection_getBooksToReadByLogin = function _BookConnection_getBooksToReadByLogin(email, password, username) {
    return __awaiter(this, void 0, void 0, function* () {
        let loginResult = yield this.login(email, password);
        if (loginResult.user_ident && loginResult.cookies) {
            yield dbman.updateUserAsync({ username: username, [this.USER_IDENT_PROPERTY]: loginResult.user_ident,
                [this.USER_COOKIES_PROPERTY]: loginResult.cookies });
            return yield __classPrivateFieldGet(this, _BookConnection_instances, "m", _BookConnection_getBooksToReadByUsername).call(this, username);
        }
        return { status: 2, error: 'error while attempting to log in' };
    });
}, _BookConnection_getToReadPage = function _BookConnection_getToReadPage(userIdent, cookies) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = {
            method: 'get',
            url: this.TO_READ_URL.format(userIdent, this.FIRST_PAGE),
            headers: {
                Cookie: cookies.join(';')
            }
        };
        const page = yield (yield axios(config)).data;
        return new jsdom.JSDOM(page).window.document;
    });
}, _BookConnection_getBooks = function _BookConnection_getBooks(userIdent, cookies, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        let books = [];
        let rawBooks = Array.from(doc.querySelectorAll(this.ALL_BOOKS_QUERY));
        this.populateBooks(rawBooks, books);
        const bookAmount = this.getBookCount(doc);
        if (bookAmount > this.BOOKS_PER_PAGE) {
            let config = {
                method: 'get',
                url: this.TO_READ_URL.format(userIdent, this.SECOND_PAGE),
                headers: {
                    Cookie: cookies.join(';')
                }
            };
            let pageAmount = Math.ceil(bookAmount / this.BOOKS_PER_PAGE);
            for (let i = this.SECOND_PAGE; i <= pageAmount; i++) {
                config.url = this.TO_READ_URL.format(userIdent, i);
                let page = yield (yield axios(config)).data;
                let tempDoc = new jsdom.JSDOM(page).window.document;
                rawBooks = Array.from(tempDoc.querySelectorAll(this.ALL_BOOKS_QUERY));
                this.populateBooks(rawBooks, books);
            }
        }
        return books;
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
