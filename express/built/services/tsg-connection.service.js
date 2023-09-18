const BookConnection = require("./book-connection.service");
class TSGConnection extends BookConnection {
    constructor() {
        super(...arguments);
        this.USER_IDENT_PROPERTY = 'tsgUsername';
        this.USER_COOKIES_PROPERTY = 'tsgCookies';
        this.SIGN_IN_URL = 'https://app.thestorygraph.com/users/sign_in';
        this.EMAIL_FIELD_ID = 'user_email';
        this.PASSWORD_FIELD_ID = 'user_password';
        this.USER_IDENT_QUERY = '#user-menu-dropdown > a:nth-child(1)';
        this.COOKIE_NAMES = ['remember_user_token'];
        this.TO_READ_URL = 'https://app.thestorygraph.com/to-read/{0}?page={1}'; //'http://localhost:3000/api/v1/users/{0}?page={1}'
        this.BOOK_AMOUNT_QUERY = '.search-results-count';
        this.ALL_BOOKS_QUERY = '#filter-list > span > .book-pane > div.hidden.md\\:block > div.book-pane-content.grid.grid-cols-10 > div.col-span-8.grid.grid-cols-8.gap-2.border.border-darkGrey.dark\\:border-darkerGrey.rounded-sm > div.col-span-5.p-4';
        this.ISBN_QUERY = 'div.hidden.edition-info.mt-3 > p:nth-child(1)';
        this.TITLE_QUERY = 'div.book-title-author-and-series > h3 > a';
        this.AUTHOR_QUERY = 'div.book-title-author-and-series > h3 > p:last-of-type > a';
        this.PUB_DATE_QUERY = 'div.edition-info.mt-3 > p:nth-child(5)';
        this.FORMAT_QUERY = 'div.edition-info.mt-3 > p:nth-child(2)';
        this.AUDIO_FORMAT = 'Audio';
        this.BOOKS_PER_PAGE = 10;
        this.FIRST_PAGE = 1;
        this.SECOND_PAGE = 2;
        this.GEN_SEPERATOR = ': ';
        this.ISBN_SEPERATOR = 'ISBN/UID:  ';
    }
    populateBooks(rawBooks, books) {
        rawBooks.forEach(rawBook => {
            this.addPrototype(rawBook);
            let format = rawBook.getElementText(this.FORMAT_QUERY).split(this.GEN_SEPERATOR)[1];
            if (format == this.AUDIO_FORMAT) {
                return;
            }
            let isbn = rawBook.getElementText(this.ISBN_QUERY).split(this.ISBN_SEPERATOR)[1];
            isbn = parseInt(isbn) || 0;
            let title = rawBook.getElementText(this.TITLE_QUERY);
            let author = rawBook.getElementText(this.AUTHOR_QUERY);
            let pubDate = rawBook.getElementText(this.PUB_DATE_QUERY).split(this.GEN_SEPERATOR)[1];
            pubDate = Date.parse(pubDate);
            books.push({ title: title, author: author, isbn: isbn, pub_date: pubDate });
        });
    }
    getBookCount(doc) {
        return doc.getElementText(this.BOOK_AMOUNT_QUERY).split(' ')[0];
    }
}
module.exports = new TSGConnection().validate();
