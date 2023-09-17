const jsdom = require('jsdom');
const axios = require('axios');
const dbman = require('../services/dbman');
const chrome = require('selenium-webdriver/chrome');
const {By,Key,Builder} = require("selenium-webdriver");

class BookConnection {

    BROWSER = 'chrome';
    HEADLESS_ARGUMENT = '--headless=new';
    NO_SANDBOX_ARGUMENT = '--no-sandbox';
    CHROME_BINARY_PATH = '/usr/bin/chromium-browser';

    constructor() {
        if (
            !this.populateBooks ||
            !this.getBookCount
        ) {
            throw new Error('Implementation is missing functions!');
        }
    }

    validate() {
        if (
            !this.hasOwnProperty('USER_IDENT_PROPERTY') ||
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
            !this.hasOwnProperty('SECOND_PAGE')
        ) {
            throw new Error('Implementation is missing fields!');
        }
        return this; 
    }

    async getBooksToRead() {
        switch (arguments.length) {
            case 1:
                return await this.#getBooksToReadByUsername(arguments[0]);
            case 3:
                return await this.#getBooksToReadByLogin(arguments[0], arguments[1], arguments[2]);
            default:
                throw new Error('Invalid number of arguments!');
        }
    }
    
    async #getBooksToReadByUsername(username) {
        const user = await dbman.findUserAsync(username);
        if (!user) {
            return { status: 1, error: 'user not found' };
        }
        
        let doc = await this.#getToReadPage(user[this.USER_IDENT_PROPERTY], user[this.USER_COOKIES_PROPERTY]);
        this.addPrototype(doc);

        let data = { amount: 0, books: [] }
        data.books = await this.#getBooks(user[this.USER_IDENT_PROPERTY], user[this.USER_COOKIES_PROPERTY], doc);
        data.amount = data.books.length;

        return {status: 0, data: data};
    }

    async #getBooksToReadByLogin(email, password, username) {
        let loginResult = await this.login(email, password);
        if (loginResult.user_ident && loginResult.cookies) {
            await dbman.updateUserAsync({username: username, [this.USER_IDENT_PROPERTY]: loginResult.user_ident, 
                [this.USER_COOKIES_PROPERTY]: loginResult.cookies});            
            return await this.#getBooksToReadByUsername(username);
        }
        return { status: 2, error: 'error while attempting to log in' };
    }

    async #getToReadPage(userIdent, cookies) {
        let config = {
            method: 'get',
            url: this.TO_READ_URL.format(userIdent, this.FIRST_PAGE),
            headers: {
                Cookie: cookies.join(';')
            }
        }
        const page = await (await axios(config)).data   
        return new jsdom.JSDOM(page).window.document;
    }

    async #getBooks(userIdent, cookies, doc) {
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
            }
            let pageAmount = Math.ceil(bookAmount / this.BOOKS_PER_PAGE);
            for (let i = this.SECOND_PAGE; i <= pageAmount; i++) {
                config.url = this.TO_READ_URL.format(userIdent, i);
                let page = await (await axios(config)).data;
                let tempDoc = new jsdom.JSDOM(page).window.document;
                rawBooks = Array.from(tempDoc.querySelectorAll(this.ALL_BOOKS_QUERY));
                this.populateBooks(rawBooks, books);
            }
        }
        
        return books;
    }

    async login(email, password) {
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
        driver = await new Builder().forBrowser(this.BROWSER).setChromeOptions(options).build();     
        
        await driver.get(this.SIGN_IN_URL);
        
        if (this.REMEMBER_ME_QUERY) {
            await driver.findElement(By.css(this.REMEMBER_ME_QUERY)).sendKeys(Key.SPACE);
        }
        await driver.findElement(By.id(this.EMAIL_FIELD_ID)).sendKeys(email);
        await driver.findElement(By.id(this.PASSWORD_FIELD_ID)).sendKeys(password, Key.RETURN);

        let user_ident = '';
        let cookies = undefined;
    
        if(await driver.getCurrentUrl() != this.SIGN_IN_URL) {
            user_ident = (await driver.findElement(By.css(this.USER_IDENT_QUERY)).getAttribute('href')).split('/').pop()
            cookies = [];
            
            (await driver.manage().getCookies()).forEach(cookie => {
                if (this.COOKIE_NAMES.includes(cookie.name)) {
                    cookies.push(`${cookie.name}=${cookie.value}`);
                }
            });
        }

        let result = { 
            user_ident: user_ident, 
            cookies: cookies 
        }
        
        await driver.quit();

        return result;
    }

    addPrototype(obj) {
        if (!obj.getElementText) {
            obj.getElementText = function (query) {
                return this.querySelector(query).textContent.trim()
            }
        }
    }
}



/*if (!Object.prototype.getElementText) {
    Object.prototype.getElementText = function(query) {
        const window = new jsdom.JSDOM().window;
        if ([window.HTMLDivElement.name, window.Document.name].includes(this.constructor.name)) {
            return this.querySelector(query).textContent.trim()
        }
    };
}*/

if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : ''
        ;
      });
    };
}

module.exports =  BookConnection;