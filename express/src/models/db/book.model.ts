import { GroupedBook } from "../grouped-book.model";

export class Book {
    id: number;
    md5: string;
    title: string;
    author: string;
    series: string;
    publisher: string;
    isbn: string[];
    asin: string;
    language: string;
    pubDate: Date;
    extension: string;
    filename: string;
    coverUrl: string;
    message: string;
    progress: number;
    local: boolean;
    groupedBooks: GroupedBook[] = [];

    constructor(id: number, md5: string, title: string, author: string, series: string, publisher: string,
    isbn: string[], language: string, pubDate: Date, extension: string, filename: string, coverUrl: string, 
    progress: number = 0, message: string = '', local: boolean = false, groupedBooks: GroupedBook[] = []) {
        this.id = id;
        this.md5 = md5;
        this.title = title;
        this.author = author;
        this.series = series;
        this.publisher = publisher;
        this.isbn = isbn;
        this.language = language;
        this.pubDate = pubDate;
        this.extension = extension;
        this.filename = filename;
        this.coverUrl = coverUrl;
        this.progress = progress;
        this.message = message;
        this.local = local;
        this.groupedBooks = groupedBooks;
    }
}