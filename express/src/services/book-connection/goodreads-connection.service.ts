import { SocialReadingPlatform } from "../../models/social-reading-platform";
import { SyncLanguage } from "../../models/sync-language.model";
import { SyncRequest } from "../../models/sync-request.model";
import { SyncStatus } from "../../models/sync-status.model";
import GenericBookConnection from "./generic-book-connection";

export default class GoodreadsConnection extends GenericBookConnection {

    PREFERED_LANGUAGE_PROPERTY = 'grPreferedLanguage';
    RIGID_LANGUAGE_PROPERTY = 'grRigidLanguage';
    USER_IDENT_PROPERTY = 'grUserId';
    USER_COOKIES_PROPERTY = 'grCookies';

    SIGN_IN_URL = 'https://www.goodreads.com/ap/signin?openid.assoc_handle=amzn_goodreads_web_na&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0';
    EMAIL_FIELD_ID = 'ap_email';
    PASSWORD_FIELD_ID = 'ap_password';
    REMEMBER_ME_QUERY = '#authportal-main-section > div:nth-child(2) > div > div > form > div > div > div > div.a-section.a-spacing-extra-large > div:nth-child(5) > div > label > div > label > input[type=checkbox]';
    USER_IDENT_QUERY = '#bodycontainer > div > div.siteHeader > div > header > div.siteHeader__topLine.gr-box.gr-box--withShadow > div > div.siteHeader__personal > ul > li:nth-child(5) > div > a';

    COOKIE_NAMES = ['_session_id2', 'sess-at-main', 'session-id', 'session-id-time', 'session-token', 'at-main', 'ubid-main'];
    TO_READ_URL = 'https://www.goodreads.com/review/list/{0}?shelf=to-read&per_page=100&page={1}'
    BOOK_AMOUNT_QUERY = '#header > h1 > span > span';
    ALL_BOOKS_QUERY = '#booksBody > tr';
    ISBN_QUERY = 'td.field.isbn13 > div';
    TITLE_QUERY = 'td.field.title > div > a';
    AUTHOR_QUERY = 'td.field.author > div > a';
    PUB_DATE_QUERY = 'td.field.date_pub > div';
    FORMAT_QUERY = 'td.field.format > div';
    LANGUAGE_QUERY = 'td.field.shelves > div > span > span > a';
    ASIN_QUERY = 'td.field.asin > div';

    BOOKS_PER_PAGE = 100;
    FIRST_PAGE = 1;
    SECOND_PAGE = 2;
    AUDIO_FORMAT = 'Audio';
    GERMAN_LANG = 'de';
    ENGLISH_LANG = 'en';

    populateBooks(username: string, preferedLanguage: SyncLanguage, rigidLanguage: boolean, rawBooks: any, 
    books: SyncRequest[]) {
        rawBooks.forEach(rawBook => {
            this.addPrototype(rawBook);
            
            let format = rawBook.getElementText(this.FORMAT_QUERY);
            if (format.includes(this.AUDIO_FORMAT)) {
                return;
            }
            let isbn = rawBook.getElementText(this.ISBN_QUERY);
            let title = rawBook.getElementText(this.TITLE_QUERY).split('\n')[0];
            let author = rawBook.getElementText(this.AUTHOR_QUERY);
            let pubDate = new Date(rawBook.getElementText(this.PUB_DATE_QUERY));
            let asin = rawBook.getElementText(this.ASIN_QUERY);
            let shelfList = Array.from(rawBook.querySelectorAll(this.LANGUAGE_QUERY));
            let language: SyncLanguage = preferedLanguage || SyncLanguage.ENGLISH;
            if (!rigidLanguage) {
                shelfList.forEach((shelf: HTMLElement) => {
                    let shelfName = shelf.textContent.trim().toLowerCase();
                    switch (shelfName) {
                        case this.GERMAN_LANG:
                            language = SyncLanguage.GERMAN
                            break;                    
                        case this.ENGLISH_LANG:
                            language = SyncLanguage.ENGLISH
                            break;
                    }
                });
            }

            books.push(
                new SyncRequest(username, isbn, title, author, pubDate, SyncStatus.IGNORE, 
                    SocialReadingPlatform.GOODREADS, language, asin)
            );
        });
    }

    getBookCount(doc: any) {
        return doc.getElementText(this.BOOK_AMOUNT_QUERY).replace(/(\(|\))/g, '');
    }

}