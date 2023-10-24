import { SyncLanguage } from "../../models/sync-language.model";
import { SyncRequest } from "../../models/sync-request.model";
import { SyncStatus } from "../../models/sync-status.model";
import GenericBookConnection from "./generic-book-connection";
import { SocialReadingPlatform } from "../../models/social-reading-platform";

export default class TSGConnection extends GenericBookConnection {

    PREFERED_LANGUAGE_PROPERTY = 'tsgPreferedLanguage';
    RIGID_LANGUAGE_PROPERTY = 'tsgRigidLanguage';
    USER_IDENT_PROPERTY = 'tsgUsername';
    USER_COOKIES_PROPERTY = 'tsgCookies';

    SIGN_IN_URL = 'https://app.thestorygraph.com/users/sign_in';
    EMAIL_FIELD_ID = 'user_email';
    PASSWORD_FIELD_ID = 'user_password';
    USER_IDENT_QUERY = '#user-menu-dropdown > a:nth-child(1)';

    COOKIE_NAMES = ['remember_user_token'];
    TO_READ_URL = 'https://app.thestorygraph.com/to-read/{0}?page={1}'
    BOOK_AMOUNT_QUERY = '.search-results-count';
    ALL_BOOKS_QUERY = '#filter-list > span > .book-pane > div.hidden.md\\:block > div.book-pane-content.grid.grid-cols-10 > div.col-span-8.grid.grid-cols-8.gap-2.border.border-darkGrey.dark\\:border-darkerGrey.rounded-sm > div.col-span-5.p-4';
    ISBN_QUERY = 'div.hidden.edition-info.mt-3 > p:nth-child(1)';
    TITLE_QUERY = 'div.book-title-author-and-series > h3 > a';
    AUTHOR_QUERY = 'div.book-title-author-and-series > h3 > p:last-of-type > a';
    PUB_DATE_QUERY = 'div.edition-info.mt-3 > p:nth-child(5)';
    FORMAT_QUERY = 'div.edition-info.mt-3 > p:nth-child(2)';
    LANGUAGE_QUERY = 'div.edition-info.mt-3 > p:nth-child(3)';

    AUDIO_FORMAT = 'Audio';
    BOOKS_PER_PAGE = 10;
    FIRST_PAGE = 1;
    SECOND_PAGE = 2;

    GEN_SEPERATOR = ': ';
    ISBN_SEPERATOR = 'ISBN/UID:  ';

    populateBooks(username: string, preferedLanguage: SyncLanguage, rigidLanguage: boolean, rawBooks: any, 
    books: SyncRequest[]) {
        rawBooks.forEach(rawBook => {
            this.addPrototype(rawBook);

            let format = rawBook.getElementText(this.FORMAT_QUERY).split(this.GEN_SEPERATOR)[1];
            if (format == this.AUDIO_FORMAT) {
                return;
            }
            let isbn = rawBook.getElementText(this.ISBN_QUERY).split(this.ISBN_SEPERATOR)[1];
            let title = rawBook.getElementText(this.TITLE_QUERY);
            let author = rawBook.getElementText(this.AUTHOR_QUERY);
            let pubDate = rawBook.getElementText(this.PUB_DATE_QUERY).split(this.GEN_SEPERATOR)[1];
            pubDate = new Date(pubDate);
            let languageText = rawBook.getElementText(this.LANGUAGE_QUERY).split(this.GEN_SEPERATOR)[1];
            let language: SyncLanguage = preferedLanguage || SyncLanguage.ENGLISH;
            if (!rigidLanguage) {
                switch (languageText) {
                    case 'German':
                        language = SyncLanguage.GERMAN;
                        break;
                    case 'English':
                        language = SyncLanguage.ENGLISH;
                        break;
                }
            }

            books.push(new SyncRequest(username, isbn, title, author, pubDate, SyncStatus.IGNORE, 
                SocialReadingPlatform.THE_STORY_GRAPH, language));
        });
    }

    getBookCount(doc: any) {        
        return doc.getElementText(this.BOOK_AMOUNT_QUERY).split(' ')[0];
    }
    
}