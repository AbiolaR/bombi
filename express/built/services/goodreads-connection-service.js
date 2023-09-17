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
var GoodreadsConnection = /** @class */ (function (_super) {
    __extends(GoodreadsConnection, _super);
    function GoodreadsConnection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.USER_IDENT_PROPERTY = 'grUserId';
        _this.USER_COOKIES_PROPERTY = 'grCookies';
        _this.SIGN_IN_URL = 'https://www.goodreads.com/ap/signin?openid.assoc_handle=amzn_goodreads_web_na&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0';
        _this.EMAIL_FIELD_ID = 'ap_email';
        _this.PASSWORD_FIELD_ID = 'ap_password';
        _this.REMEMBER_ME_QUERY = '#authportal-main-section > div:nth-child(2) > div > div > form > div > div > div > div.a-section.a-spacing-extra-large > div:nth-child(5) > div > label > div > label > input[type=checkbox]';
        _this.USER_IDENT_QUERY = '#bodycontainer > div > div.siteHeader > div > header > div.siteHeader__topLine.gr-box.gr-box--withShadow > div > div.siteHeader__personal > ul > li:nth-child(5) > div > a';
        _this.COOKIE_NAMES = ['_session_id2', 'sess-at-main', 'session-id', 'session-id-time', 'session-token'];
        _this.TO_READ_URL = 'https://www.goodreads.com/review/list/{0}?shelf=to-read&per_page=100&page={1}';
        _this.BOOK_AMOUNT_QUERY = '#header > h1 > span > span';
        _this.ALL_BOOKS_QUERY = '#booksBody > tr';
        _this.ISBN_QUERY = 'td.field.isbn13 > div';
        _this.TITLE_QUERY = 'td.field.title > div > a';
        _this.AUTHOR_QUERY = 'td.field.author > div > a';
        _this.PUB_DATE_QUERY = 'td.field.date_pub > div';
        _this.FORMAT_QUERY = 'td.field.format > div';
        _this.BOOKS_PER_PAGE = 100;
        _this.FIRST_PAGE = 1;
        _this.SECOND_PAGE = 2;
        _this.AUDIO_FORMAT = 'Audio';
        return _this;
    }
    GoodreadsConnection.prototype.populateBooks = function (rawBooks, books) {
        var _this = this;
        rawBooks.forEach(function (rawBook) {
            _this.addPrototype(rawBook);
            var format = rawBook.getElementText(_this.FORMAT_QUERY);
            if (format.includes(_this.AUDIO_FORMAT)) {
                return;
            }
            var isbn = parseInt(rawBook.getElementText(_this.ISBN_QUERY)) || 0;
            var title = rawBook.getElementText(_this.TITLE_QUERY).split('\n')[0];
            var author = rawBook.getElementText(_this.AUTHOR_QUERY);
            var pubDate = Date.parse(rawBook.getElementText(_this.PUB_DATE_QUERY));
            books.push({ title: title, author: author, isbn: isbn, pub_date: pubDate });
        });
    };
    GoodreadsConnection.prototype.getBookCount = function (doc) {
        return doc.getElementText(this.BOOK_AMOUNT_QUERY).replace(/(\(|\))/g, '');
    };
    return GoodreadsConnection;
}(BookConnection));
module.exports = new GoodreadsConnection().validate();
