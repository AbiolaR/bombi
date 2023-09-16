const BookConnection = require("./book-connection.service");

class TSGConnection extends BookConnection {

    USER_IDENT_PROPERTY = 'tsgUsername';
    USER_COOKIES_PROPERTY = 'tsgCookies';

    SIGN_IN_URL = 'https://app.thestorygraph.com/users/sign_in';
    EMAIL_FIELD_ID = 'user_email';
    PASSWORD_FIELD_ID = 'user_password';
    USER_IDENT_QUERY = '#user-menu-dropdown > a:nth-child(1)';

    COOKIE_NAMES = ['remember_user_token'];
    TO_READ_URL = 'https://app.thestorygraph.com/to-read/{0}?page={1}'//'http://localhost:3000/api/v1/users/{0}?page={1}'
    BOOK_AMOUNT_QUERY = '.search-results-count';
    ALL_BOOKS_QUERY = '#filter-list > span > .book-pane > div.hidden.md\\:block > div.book-pane-content.grid.grid-cols-10 > div.col-span-8.grid.grid-cols-8.gap-2.border.border-darkGrey.dark\\:border-darkerGrey.rounded-sm > div.col-span-5.p-4';
    ISBN_QUERY = 'div.hidden.edition-info.mt-3 > p:nth-child(1)';
    TITLE_QUERY = 'div.book-title-author-and-series > h3 > a';
    AUTHOR_QUERY = 'div.book-title-author-and-series > h3 > p:last-of-type > a';
    PUB_DATE_QUERY = 'div.edition-info.mt-3 > p:nth-child(5)';
    FORMAT_QUERY = 'div.edition-info.mt-3 > p:nth-child(2)';    

    AUDIO_FORMAT = 'Audio';
    BOOKS_PER_PAGE = 10;
    FIRST_PAGE = 1;
    SECOND_PAGE = 2;

    GEN_SEPERATOR = ': ';
    ISBN_SEPERATOR = 'ISBN/UID:  ';

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