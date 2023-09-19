import axios from "axios";
import { JSDOM } from "jsdom";
import { Options } from "selenium-webdriver/chrome";
import { By, Key, Builder } from "selenium-webdriver";
import { ExternalLoginResult } from "../models/external-login-result";
import { ServerResponse } from "../models/server-response";
import { SyncRequest } from "../models/sync-request.model";
import { BookConnection } from "./book-connection.interface";
import { findUserAsync, updateUserAsync } from "./dbman";

export default abstract class GenericBookConnection implements BookConnection {
    USER_IDENT_PROPERTY: string;
    USER_COOKIES_PROPERTY: string;
    SIGN_IN_URL: string;
    EMAIL_FIELD_ID: string;
    PASSWORD_FIELD_ID: string;
    REMEMBER_ME_QUERY: string;
    USER_IDENT_QUERY: string;
    COOKIE_NAMES: string[];
    TO_READ_URL: string;
    BOOK_AMOUNT_QUERY: string;
    ALL_BOOKS_QUERY: string;
    ISBN_QUERY: string;
    TITLE_QUERY: string;
    AUTHOR_QUERY: string;
    PUB_DATE_QUERY: string;
    FORMAT_QUERY: string;
    BOOKS_PER_PAGE: number;
    FIRST_PAGE: number;
    SECOND_PAGE: number;
    AUDIO_FORMAT: string;
    BROWSER: string = 'chrome';
    HEADLESS_ARGUMENT: string = '--headless=new';
    NO_SANDBOX_ARGUMENT: string = '--no-sandbox';
    CHROME_BINARY_PATH: string = '/usr/bin/chromium-browser';

    async getBooksToRead(): Promise<ServerResponse<SyncRequest[]>> {
        switch (arguments.length) {
            case 1:
                return await this.getBooksToReadByUsername(arguments[0]);
            case 3:
                return await this.getBooksToReadByLogin(arguments[0], arguments[1], arguments[2]);
            default:
                throw new Error('Invalid number of arguments!');
        }
    }

    async getBooksToReadByUsername(username: string): Promise<ServerResponse<SyncRequest[]>> {
        const user = await findUserAsync(username);
        if (!user) {
            return new ServerResponse([], 1, 'user not found');
        }
        
        let doc = await this.getToReadPage(user[this.USER_IDENT_PROPERTY], 
            user[this.USER_COOKIES_PROPERTY]);
        this.addPrototype(doc);

        let syncRequests = await this.getBooks(username, user[this.USER_IDENT_PROPERTY], 
            user[this.USER_COOKIES_PROPERTY], doc);

        return new ServerResponse(syncRequests);
    }

    async getBooksToReadByLogin(email: string, password: string, username: string): Promise<ServerResponse<SyncRequest[]>> {
        let loginResult = await this.login(email, password);
        if (loginResult.userIdent && loginResult.cookies) {            
            await updateUserAsync({username: username, 
                [this.USER_IDENT_PROPERTY]: loginResult.userIdent, 
                [this.USER_COOKIES_PROPERTY]: loginResult.cookies});            
            return await this.getBooksToReadByUsername(username);
        }
        return new ServerResponse([], 2, 'error while attempting to log in');
    }

    async getToReadPage(userIdent: string, cookies: string[]): Promise<Document> {
        let config = {
            method: 'get',
            url: this.TO_READ_URL.format(userIdent, this.FIRST_PAGE.toString()),
            headers: {
                Cookie: cookies.join(';')
            }
        }
        const page = await (await axios(config)).data   
        return new JSDOM(page).window.document;
    }    
    
    async getBooks(username: string, userIdent: string, cookies: string[], doc: Document): Promise<SyncRequest[]> {
        let books = [];        

        let rawBooks = Array.from(doc.querySelectorAll(this.ALL_BOOKS_QUERY));        
        this.populateBooks(username, rawBooks, books);        

        const bookAmount = this.getBookCount(doc);
        if (bookAmount > this.BOOKS_PER_PAGE) {
            let config = {
                method: 'get',
                url: this.TO_READ_URL.format(userIdent, this.SECOND_PAGE.toString()),
                headers: {
                    Cookie: cookies.join(';')
                }
            }
            let pageAmount = Math.ceil(bookAmount / this.BOOKS_PER_PAGE);
            for (let i = this.SECOND_PAGE; i <= pageAmount; i++) {
                config.url = this.TO_READ_URL.format(userIdent, i.toString());
                let page = await (await axios(config)).data;
                let tempDoc = new JSDOM(page).window.document;
                rawBooks = Array.from(tempDoc.querySelectorAll(this.ALL_BOOKS_QUERY));
                this.populateBooks(username, rawBooks, books);
            }
        }
        
        return books;
    }
    
    
    async login(email: string, password: string): Promise<ExternalLoginResult> {
        const headless = true;
        const prod = false;
        let driver;
        
        //To wait for browser to build and launch properly
        let options = new Options();
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

        let loginResult = new ExternalLoginResult();
    
        if(await driver.getCurrentUrl() != this.SIGN_IN_URL) {
            loginResult.userIdent = (await driver.findElement(By.css(this.USER_IDENT_QUERY)).getAttribute('href')).split('/').pop()
            loginResult.cookies = [];
            
            (await driver.manage().getCookies()).forEach(cookie => {
                if (this.COOKIE_NAMES.includes(cookie.name)) {
                    loginResult.cookies.push(`${cookie.name}=${cookie.value}`);
                }
            });
        }
      
        await driver.quit();

        return loginResult;
    }

    addPrototype(obj: any) {
        if (!obj.getElementText) {
            obj.getElementText = function (query: string) {
                return this.querySelector(query).textContent.trim()
            }
        }
    }
    
    abstract getBookCount(doc: Document): number
    abstract populateBooks(username: string, rawBooks: Element[], books: SyncRequest[]): void
}


declare global {
    interface String {
        format(...args: string[]): string;
    }
    /*interface Element {
        getElementText(query: string): string;
    }*/
}

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

/*if (!Element.prototype.getElementText) {
    Element.prototype.getElementText = function(query: string) {
        return this.querySelector(query).textContent.trim();
    }
}*/