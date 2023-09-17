var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BookConnection = require("./book-connection.service");
var TSGConnection = /** @class */ (function (_super) {
    __extends(TSGConnection, _super);
    function TSGConnection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.USER_IDENT_PROPERTY = 'tsgUsername';
        _this.USER_COOKIES_PROPERTY = 'tsgCookies';
        _this.SIGN_IN_URL = 'https://app.thestorygraph.com/users/sign_in';
        _this.EMAIL_FIELD_ID = 'user_email';
        _this.PASSWORD_FIELD_ID = 'user_password';
        _this.USER_IDENT_QUERY = '#user-menu-dropdown > a:nth-child(1)';
        _this.COOKIE_NAMES = ['remember_user_token'];
        _this.TO_READ_URL = 'https://app.thestorygraph.com/to-read/{0}?page={1}'; //'http://localhost:3000/api/v1/users/{0}?page={1}'
        _this.BOOK_AMOUNT_QUERY = '.search-results-count';
        _this.ALL_BOOKS_QUERY = '#filter-list > span > .book-pane > div.hidden.md\\:block > div.book-pane-content.grid.grid-cols-10 > div.col-span-8.grid.grid-cols-8.gap-2.border.border-darkGrey.dark\\:border-darkerGrey.rounded-sm > div.col-span-5.p-4';
        _this.ISBN_QUERY = 'div.hidden.edition-info.mt-3 > p:nth-child(1)';
        _this.TITLE_QUERY = 'div.book-title-author-and-series > h3 > a';
        _this.AUTHOR_QUERY = 'div.book-title-author-and-series > h3 > p:last-of-type > a';
        _this.PUB_DATE_QUERY = 'div.edition-info.mt-3 > p:nth-child(5)';
        _this.FORMAT_QUERY = 'div.edition-info.mt-3 > p:nth-child(2)';
        _this.AUDIO_FORMAT = 'Audio';
        _this.BOOKS_PER_PAGE = 10;
        _this.FIRST_PAGE = 1;
        _this.SECOND_PAGE = 2;
        _this.GEN_SEPERATOR = ': ';
        _this.ISBN_SEPERATOR = 'ISBN/UID:  ';
        return _this;
    }
    TSGConnection.prototype.populateBooks = function (rawBooks, books) {
        var _this = this;
        rawBooks.forEach(function (rawBook) {
            _this.addPrototype(rawBook);
            var format = rawBook.getElementText(_this.FORMAT_QUERY).split(_this.GEN_SEPERATOR)[1];
            if (format == _this.AUDIO_FORMAT) {
                return;
            }
            var isbn = rawBook.getElementText(_this.ISBN_QUERY).split(_this.ISBN_SEPERATOR)[1];
            isbn = parseInt(isbn) || 0;
            var title = rawBook.getElementText(_this.TITLE_QUERY);
            var author = rawBook.getElementText(_this.AUTHOR_QUERY);
            var pubDate = rawBook.getElementText(_this.PUB_DATE_QUERY).split(_this.GEN_SEPERATOR)[1];
            pubDate = Date.parse(pubDate);
            books.push({ title: title, author: author, isbn: isbn, pub_date: pubDate });
        });
    };
    TSGConnection.prototype.getBookCount = function (doc) {
        return doc.getElementText(this.BOOK_AMOUNT_QUERY).split(' ')[0];
    };
    return TSGConnection;
}(BookConnection));
module.exports = new TSGConnection().validate();
