import { identifier } from "@sequelize/core/types/expression-builders/identifier";
import { Book } from "../../models/db/book.model";
import { GoogleBook } from "../../models/google-book.model";
import { SearchResponse } from "../../models/google-books/search-response.model";
import { SyncLanguage } from "../../models/sync-language.model";
import { DEC } from "../secman";
import axios from "axios";

export class GoogleBooksSearchService {
    private static readonly API_KEY = DEC('U2FsdGVkX19xDpW0bIUUp+Wep4V1lJ1NWJPDVrpGzuOM7el6f9PugO7EaWfeVPucqPmffkjfUZtlAb22oifz+A==');
    private static readonly SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes?q=subject:fiction+intitle:';
    private static readonly ISBN_SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes?q=isbn:';
    private static readonly UPPERCASE_REGEX = /^[A-Z]+$/;
    private static readonly ISBN = 'ISBN_10';
    private static readonly ISBN_13 = 'ISBN_13';

    public static async search(searchString: string, previouslyFoundBooks: Book[], selectedLang: string): Promise<Book[]> {
        const response = await axios.get<SearchResponse>(`${this.SEARCH_URL}"${searchString}"
            &printType=books&key=${this.API_KEY}`);    
        
        if (response.data.totalItems == 0) {
            return [];
        }

        let books = response.data.items.map(volume => 
            new Book(999999999, '', volume.volumeInfo.title, volume.volumeInfo?.authors?.at(0) || '', '', '',
                this.parseISBN(volume), '', this.parseLanguage(volume),
                new Date(volume.volumeInfo.publishedDate), '', '',
                volume.volumeInfo?.imageLinks?.thumbnail.replace('http://', 'https://')));

        return this.merge(books, previouslyFoundBooks, selectedLang);
    }

    public static async searchByIsbn(isbn: string): Promise<string> {
        const response = await axios.get<SearchResponse>(`${this.ISBN_SEARCH_URL}${isbn}
            &printType=books&key=${this.API_KEY}`);    
        
        if (response.data.totalItems == 0) {
            return '';
        }

        return response.data.items[0].volumeInfo.title;
    }

    private static merge(books: Book[], previouslyFoundBooks: Book[], selectedLang: string): Book[] {
        let mergedBooks: Book[] = [];

        books.forEach(book => {
            if (previouslyFoundBooks.find(pfBook => 
            this.simplify(pfBook.title) == this.simplify(book.title))) {
                return;
            }
            if (selectedLang && book.language != selectedLang) {
                return;
            }
            let mBookIndex = mergedBooks.findIndex(mBook => 
                this.simplify(mBook.title) == this.simplify(book.title)
                && this.simplify(mBook.author) == this.simplify(book.author)
                && this.simplify(mBook.pubDate.getFullYear().toString()) == this.simplify(book.pubDate.getFullYear().toString())
                && this.simplify(mBook.language) == this.simplify(book.language));
            let mergedBook = mergedBooks[mBookIndex];
            if (mergedBook) {
                if (mergedBook.coverUrl && book.coverUrl) {
                    if (this.UPPERCASE_REGEX.test(mergedBook.title)) {
                        mergedBooks.splice(mBookIndex, 1, book);
                    }
                } else {
                    if (!mergedBook.coverUrl) {
                        mergedBooks.splice(mBookIndex, 1, book);
                    }
                }
            } else {
                mergedBooks.push(book);
            }
        });
        
        return mergedBooks;
    }

    private static simplify(string: string): string {
        return string.replace(/[^a-z]/gi, '').toLowerCase();
    }

    private static parseISBN(volume: GoogleBook): string[] {
        return volume.volumeInfo.industryIdentifiers?.filter(identifier => 
            [this.ISBN, this.ISBN_13].includes(identifier.type)
        ).map(identifier => identifier.identifier) || [];
    }

    private static parseLanguage(volume: GoogleBook): SyncLanguage {
        switch (volume.volumeInfo.language) {
            case 'de':
                return SyncLanguage.GERMAN
            case 'es':
                return SyncLanguage.SPANISH
            case 'fr':
                return SyncLanguage.FRENCH
            case 'it':
                return SyncLanguage.ITALIAN
            case 'nl':
                return SyncLanguage.DUTCH
            case 'pt':
                return SyncLanguage.PORTUGUESE
            case 'pl':
                return SyncLanguage.POLISH
            case 'ru':
                return SyncLanguage.RUSSIAN
            case 'ja':
                return SyncLanguage.JAPANESE                
            default:
                return SyncLanguage.ENGLISH
        } 
    }
}