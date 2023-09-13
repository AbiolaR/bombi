const BookConnection = require("./book-connection.service");
const jsdom = require('jsdom');
const axios = require('axios');
const {By,Key,Builder} = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');
const dbman = require('../services/dbman');

class TSGConnection extends BookConnection {

    TO_READ_URL = 'https://app.thestorygraph.com/to-read/{0}?page={1}'//'http://localhost:3000/api/v1/users/{0}?page={1}'
    SIGN_IN_URL = 'https://app.thestorygraph.com/users/sign_in';

    TOKEN_COOKIE_NAME = 'remember_user_token';

    SEARCH_RESULT_QUERY = '.search-results-count';
    ALL_BOOKS_QUERY = '#filter-list > span > .book-pane > div.hidden.md\\:block > div.book-pane-content.grid.grid-cols-10 > div.col-span-8.grid.grid-cols-8.gap-2.border.border-darkGrey.dark\\:border-darkerGrey.rounded-sm > div.col-span-5.p-4';
    ISBN_QUERY = 'div.hidden.edition-info.mt-3 > p:nth-child(1)';
    TITLE_QUERY = 'div.book-title-author-and-series > h3 > a';
    AUTHOR_QUERY = 'div.book-title-author-and-series > h3 > p:last-of-type > a';
    PUB_DATE_QUERY = 'div.edition-info.mt-3 > p:nth-child(5)';
    FORMAT_QUERY = 'div.edition-info.mt-3 > p:nth-child(2)';
    USERNAME_XPATH = '//*[@id="user-menu-dropdown"]/a[1]';
    USER_EMAIL_ID = 'user_email';
    USER_PASSWORD_ID = 'user_password';

    AUDIO_FORMAT = 'Audio';
    BOOKS_PER_PAGE = 10;
    FIRST_PAGE = 1;
    SECOND_PAGE = 2;

    BROWSER = 'chrome';
    HEADLESS_ARGUMENT = '--headless=new';
    NO_SANDBOX_ARGUMENT = '--no-sandbox';
    CHROME_BINARY_PATH = '/usr/bin/chromium-browser';

    getBooksToRead() {
        switch (arguments.length) {
            case 1:
                return this.#getBooksToReadByUsername(arguments[0]);
            case 3:
                return this.#getBooksToReadByLogin(arguments[0], arguments[1], arguments[2]);
            default:
                throw new Error('Invalid number of arguments!');
        }
    }
    
    async #getBooksToReadByUsername(username) {
        const user = await dbman.findUserAsync(username);
        if (!user) {
            return { status: 1, error: 'user not found' };
        }
        let doc = await this.#getToReadPage('nelee', user.tsgToken);

        let data = { amount: 0, books: [] }
        data.books = await this.#getBooks('nelee', user.tsgToken, doc);
        data.amount = data.books.length;

        return {status: 0, data: data};
    }

    async #getBooksToReadByLogin(email, password, username) {
        let loginResult = await this.#login(email, password);
        if (loginResult.username && loginResult.token) {
            await dbman.updateUserAsync({username: username, tsgUsername: loginResult.username, tsgToken: loginResult.token});
            return await this.#getBooksToReadByUsername(username);
        }
        return { status: 1, error: 'error while attempting to log in' };
    }

    async #getToReadPage(username, token) {
        let config = {
            method: 'get',
            url: this.TO_READ_URL.format(username, this.FIRST_PAGE),
            headers: {
                Cookie: `${this.TOKEN_COOKIE_NAME}=${token}`
            }
        }
        const page = await (await axios(config)).data   
        return new jsdom.JSDOM(page).window.document;
    }

    #getBookCount(doc) {
        return Array.from(doc.querySelectorAll(this.SEARCH_RESULT_QUERY))[0].textContent.split(' ')[0];
    }

    async #getBooks(username, token, doc) {
        let books = [];        

        let rawBooks = Array.from(doc.querySelectorAll(this.ALL_BOOKS_QUERY));        
        this.#populateBooks(rawBooks, books);        

        const bookAmount = this.#getBookCount(doc);
        if (bookAmount > this.BOOKS_PER_PAGE) {
            let config = {
                method: 'get',
                url: this.TO_READ_URL.format(username, this.SECOND_PAGE),
                headers: {
                    Cookie: `${this.TOKEN_COOKIE_NAME}=${token}`
                }
            }
            let pageAmount = Math.ceil(bookAmount / this.BOOKS_PER_PAGE);
            for (let i = this.SECOND_PAGE; i <= pageAmount; i++) {
                config.url = this.TO_READ_URL.format(username, i);
                let page = await (await axios(config)).data;
                let tempDoc = new jsdom.JSDOM(page).window.document;
                rawBooks = Array.from(tempDoc.querySelectorAll(this.ALL_BOOKS_QUERY));
                this.#populateBooks(rawBooks, books);
            }
        }
        
        return books;
    }

    #populateBooks(rawBooks, books) {
        rawBooks.forEach(rawBook => {
            let format = Array.from(rawBook.querySelectorAll(this.FORMAT_QUERY))[0].textContent.split(': ')[1];
            if (format == this.AUDIO_FORMAT) {
                return;
            }
            let isbn = Array.from(rawBook.querySelectorAll(this.ISBN_QUERY))[0].textContent.split('ISBN/UID:  ')[1];
            isbn = parseInt(isbn) || 0;
            let title = Array.from(rawBook.querySelectorAll(this.TITLE_QUERY))[0].textContent;
            let author = Array.from(rawBook.querySelectorAll(this.AUTHOR_QUERY))[0].textContent;
            let pubDate = Array.from(rawBook.querySelectorAll(this.PUB_DATE_QUERY))[0].textContent.split(': ')[1];
            pubDate = Date.parse(pubDate);
            books.push({ title: title, author: author, isbn: isbn, pub_date: pubDate });
        });
    }

    async #login(user_email, user_password) {
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
        
        //To send a search query by passing the value in searchString.
        await driver.findElement(By.id(this.USER_EMAIL_ID)).sendKeys(user_email);
        await driver.findElement(By.id(this.USER_PASSWORD_ID)).sendKeys(user_password, Key.RETURN);
    
        let result = { 
            username: (await driver.findElement(By.xpath(this.USERNAME_XPATH)).getAttribute('href')).split('/').pop(), 
            token: (await (driver.manage().getCookie(this.TOKEN_COOKIE_NAME))).value 
        }
        
        await driver.quit();

        return result;
    }

}

if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
}

module.exports = new TSGConnection();