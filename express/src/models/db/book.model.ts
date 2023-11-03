export class Book {
    md5: string;
    title: string;
    author: string;
    isbn: string;
    language: string;
    year: string;
    filename: string;
    coverUrl: string;
    message: string;

    constructor(md5: string, title: string, author: string, isbn: string, language: string, year: string,
    filename: string, coverUrl: string, message: string = '') {
        this.md5 = md5;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.language = language;
        this.year = year;
        this.filename = filename;
        this.coverUrl = coverUrl;
        this.message = message;    
    }
}