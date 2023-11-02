import { Credentials } from "../../models/credentials";
import { ExternalLoginResult } from "../../models/external-login-result";
import { ServerResponse } from "../../models/server-response";
import { SyncLanguage } from "../../models/sync-language.model";
import { SyncRequest } from "../../models/sync-request.model";

export interface BookConnection {
    readonly PREFERED_LANGUAGE_PROPERTY: string;
    readonly RIGID_LANGUAGE_PROPERTY: string;
    readonly USE_SYNC_TAG_PROPRTY: string;
    readonly USER_IDENT_PROPERTY: string;
    readonly USER_COOKIES_PROPERTY: string;

    readonly SIGN_IN_URL: string;
    readonly EMAIL_FIELD_ID: string;
    readonly PASSWORD_FIELD_ID: string;
    readonly REMEMBER_ME_QUERY: string;
    readonly USER_IDENT_QUERY: string;

    readonly COOKIE_NAMES: string[];
    readonly TO_READ_URL: string
    readonly BOOK_AMOUNT_QUERY: string;
    readonly ALL_BOOKS_QUERY: string;
    readonly ISBN_QUERY: string;
    readonly TITLE_QUERY: string;
    readonly AUTHOR_QUERY: string;
    readonly PUB_DATE_QUERY: string;
    readonly FORMAT_QUERY: string;   
    readonly LANGUAGE_QUERY: string;
    readonly ASIN_QUERY: string; 

    readonly BOOKS_PER_PAGE: number;
    readonly FIRST_PAGE: number;
    readonly SECOND_PAGE: number;
    readonly AUDIO_FORMAT: string;

    getBooksToRead(): Promise<ServerResponse<SyncRequest[]>>;
    getBooksToReadByUsername(username: string): Promise<ServerResponse<SyncRequest[]>>;
    getBooksToReadByLogin(username: string, credentials: Credentials, preferedLanguage: SyncLanguage, rigidLanguage: boolean, useSyncTag: boolean): Promise<ServerResponse<SyncRequest[]>>;

    getToReadPage(userIdent: string, cookies: string[]): Promise<Document>;
    getBooks(username: string, userIdent: string, cookies: string[], preferedLanguage: SyncLanguage, rigidLanguage: boolean, useSyncTag: boolean, doc: Document): Promise<SyncRequest[]>;
    
    login(credentials: Credentials): Promise<ExternalLoginResult>;
    addPrototype(obj: any): void;
    
    getBookCount(doc: Document): number;
    populateBooks(username: string, preferedLanguage: SyncLanguage, rigidLanguage: boolean, useSyncTag: boolean, rawBooks: Element[], books: SyncRequest[]): void;
}