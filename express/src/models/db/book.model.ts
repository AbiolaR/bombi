export class Book {
    id: number;
    md5: string;
    title: string;
    author: string;
    series: string;
    publisher: string;
    isbn: string;
    language: string;
    year: string;
    extension: string;
    filename: string;
    coverUrl: string;
    message: string;

    constructor(id: number, md5: string, title: string, author: string, series: string, publisher: string,
    isbn: string, language: string, year: string, extension: string, filename: string, coverUrl: string, 
    message: string = '') {
        this.id = id;
        this.md5 = md5;
        this.title = title;
        this.author = author;
        this.series = series;
        this.publisher = publisher;
        this.isbn = isbn;
        this.language = language;
        this.year = year;
        this.extension = extension;
        this.filename = filename;
        this.coverUrl = coverUrl;
        this.message = message;    
    }
}