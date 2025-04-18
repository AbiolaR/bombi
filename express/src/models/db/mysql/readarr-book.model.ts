import { InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";

export class ReadarrBook extends Model<InferAttributes<ReadarrBook>, InferCreationAttributes<ReadarrBook>> {
    declare id: number;
    declare title: string;
    declare author: string;
    declare series: string;
    declare language: string;
    declare year: number;
    declare pubDate: Date;
    declare isbn: string;
    declare coverUrl: string;
    declare extension: string;
    declare filename: string;

    /*constructor(id: number, title: string, author: string, series: string, language: string, year: string, pubDate: Date, isbn: string, coverUrl: string, extension: string, filename: string) {
        super();
        this.id = id;
        this.title = title;
        this.author = author;
        this.series = series;
        this.language = language;
        this.year = year;
        this.pubDate = pubDate;
        this.isbn = isbn;
        this.coverUrl = coverUrl;
        this.extension = extension;
        this.filename = filename;
    }*/
}

export type ReadarrBookColumn = 
    | 'id'
    | 'title'
    | 'author'
    | 'series'
    | 'language'
    | 'year'
    | 'pubDate'
    | 'isbn'
    | 'coverUrl'
    | 'extension'
    | 'filename'