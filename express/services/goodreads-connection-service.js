const BookConnection = require("./book-connection.service");

class GoodreadsConnection extends BookConnection {

    USER_IDENT_PROPERTY = 'grUserId';
    USER_COOKIES_PROPERTY = 'grCookies';

    SIGN_IN_URL = 'https://www.goodreads.com/ap/signin?openid.assoc_handle=amzn_goodreads_web_na&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0';
    EMAIL_FIELD_ID = 'ap_email';
    PASSWORD_FIELD_ID = 'ap_password';
    REMEMBER_ME_QUERY = '#authportal-main-section > div:nth-child(2) > div > div > form > div > div > div > div.a-section.a-spacing-extra-large > div:nth-child(5) > div > label > div > label > input[type=checkbox]';
    USER_IDENT_QUERY = '#bodycontainer > div > div.siteHeader > div > header > div.siteHeader__topLine.gr-box.gr-box--withShadow > div > div.siteHeader__personal > ul > li:nth-child(5) > div > a';

    COOKIE_NAMES = ['_session_id2', 'sess-at-main', 'session-id', 'session-id-time', 'session-token'];
    TO_READ_URL = 'https://www.goodreads.com/review/list/{0}?shelf=to-read&per_page=100&page={1}'
    BOOK_AMOUNT_QUERY = '#header > h1 > span > span';
    ALL_BOOKS_QUERY = '#booksBody > tr';
    ISBN_QUERY = 'td.field.isbn13 > div';
    TITLE_QUERY = 'td.field.title > div > a';
    AUTHOR_QUERY = 'td.field.author > div > a';
    PUB_DATE_QUERY = 'td.field.date_pub > div';
    FORMAT_QUERY = 'td.field.format > div';    

    BOOKS_PER_PAGE = 100;
    FIRST_PAGE = 1;
    SECOND_PAGE = 2;
    AUDIO_FORMAT = 'Audio';

    populateBooks(rawBooks, books) {
        rawBooks.forEach(rawBook => {
            this.addPrototype(rawBook);
            
            let format = rawBook.getElementText(this.FORMAT_QUERY);
            if (format.includes(this.AUDIO_FORMAT)) {
                return;
            }
            let isbn = parseInt(rawBook.getElementText(this.ISBN_QUERY)) || 0;
            let title = rawBook.getElementText(this.TITLE_QUERY).split('\n')[0];
            let author = rawBook.getElementText(this.AUTHOR_QUERY);
            let pubDate = Date.parse(rawBook.getElementText(this.PUB_DATE_QUERY));

            books.push({ title: title, author: author, isbn: isbn, pub_date: pubDate });
        });
    }

    getBookCount(doc) {
        return doc.getElementText(this.BOOK_AMOUNT_QUERY).replace(/(\(|\))/g, '');
    }

}

module.exports = new GoodreadsConnection().validate();