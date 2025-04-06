import { Sequelize, Op, DataTypes, sql, Literal, col } from "@sequelize/core";
import { LibgenParams } from "../../models/db/mysql/libgen-params.model";
import { initLibgenBookModel } from "../../models/db/mysql/libgen-book.model.init";
import { FictionBook, LibgenBook, LibgenBookColumn, NonFictionBook } from "../../models/db/mysql/libgen-book.model";
import { DEC } from '../secman';
import { Book } from "../../models/db/book.model";
import { initReadarrBookModel } from "../../models/db/mysql/readarr-book.model.init";
import { ReadarrBook, ReadarrBookColumn } from "../../models/db/mysql/readarr-book.model";
import { initLibgenNonFictionBookModel } from "../../models/db/mysql/libgen-non-fiction-book.model.init";
import { BookType } from "../../models/book-type.enum";
import { readFileSync } from "fs";
import { resolve } from "path";
import { BookService } from "../book/book.service";
import { file } from "jszip";

export class LibgenDbService {
    private static sequelize: Sequelize;
    private readonly SEARCH_LIMIT = 50;
    private readonly HOST_IP = 'host_ip';
    private readonly permittedExtensions = ['epub'];
    private static FULL_INDEXED_SEARCH: string;

    constructor() {
        
    }

    public static async initDB() {
        this.sequelize = new Sequelize(
            DEC('U2FsdGVkX19Rdz0oa5ZdqlLSp24hoiVyC7T5LHFAxH4='), // DB name
            DEC('U2FsdGVkX1+C3L9Ljwi4EbDVss0tzXyRMShvEiQASCk='), // username
            DEC('U2FsdGVkX1/UuKxHGBGj1ote/c3ZTCh8iOeJZPFqSpo='), // password
            {
                host: DEC('U2FsdGVkX1+05Zg5oW8quqoZqd7gvSrRAt+EPn4DRpY='),
                dialect: DEC('U2FsdGVkX1+owrCFwZIw+8WDF1hZTPAc1je+z9tlfnc='),
                timezone: '+02:00',
                logging: false
            }
        );

        this.FULL_INDEXED_SEARCH = readFileSync(resolve(__dirname, '../../../resources/sql/fullIndexedSearch.sql')).toString();
        
        await this.sequelize.authenticate();
        this.initModels();
    }

    async indexedFullSearch(searchString: string, defaultLang: string, page: number): Promise<Book[]> {
        let language = searchString.split('lang:')[1] || '';
        let languageQuery = {};
        if (language) {
            languageQuery = { Language: language };
            searchString = searchString.replace('lang:' + language, '');
        }
        searchString = searchString.split(' ').map(word => `+${word}`).join(' ');
        const orderedSearchString = `"${searchString}"`;

        const offset = (page - 1) * this.SEARCH_LIMIT;
        const limit = offset + this.SEARCH_LIMIT;

        let books = LibgenDbService.sequelize.query(LibgenDbService.FULL_INDEXED_SEARCH,
            { 
                replacements: { 
                    search_term: searchString, 
                    isbn_search_term: searchString.replaceAll('+', ''),
                    ordered_search_term: orderedSearchString, 
                    default_language: defaultLang,
                    language: language,
                    extensions: this.permittedExtensions.join(','),
                    limit: limit,
                    offset: offset
                },
                model: FictionBook,
                mapToModel: true
            }
        );                

        let localBooks: Promise<Book[]>;
        if (page == 1) {
            localBooks = this.indexedLocalSearch(searchString, languageQuery);
        }

        let [foundBooks, foundLocalBooks = []] = await Promise.all([books, localBooks]);

        return foundLocalBooks.concat(foundBooks.map(book => {
            let year: Date;
            if (book.Year) {
                year = new Date(book.Year);
            }
            let fileName = `${book.Title}.${book.Extension}`;
            let isLocal = BookService.bookFileIsLocal(fileName, book.MD5);

            return new Book(book.ID, book.MD5, book.Title, 
                book.Author, book.Series, book.Publisher, book.Identifier.split(',')[0], book.Language, 
                year, book.Extension, fileName, book.Coverurl, 0, '', isLocal);
        }));
    }

    private async indexedLocalSearch(searchString: String, languageQuery: any): Promise<Book[]> {
        searchString = searchString.replaceAll('+', '');
        let booksByText = ReadarrBook.findAll({
            attributes: {
                include: [
                    [sql`(1.3 * (MATCH(series) AGAINST (${searchString} IN BOOLEAN MODE))
                    + (1 * (MATCH(title) AGAINST (${searchString} IN BOOLEAN MODE)))
                    + (0.6 * (MATCH(author) AGAINST (${searchString} IN BOOLEAN MODE))))`, 'relevance']
                ]
            },
            where: [
                sql`MATCH (title, author, series) AGAINST(${searchString} IN BOOLEAN MODE)`,
                { extension: this.permittedExtensions },
                languageQuery
            ],
            order: [['relevance', 'DESC']]
        });

        let booksByIsbn = ReadarrBook.findAll({
            where: [
                sql`MATCH (isbn) AGAINST(${searchString})`,
                { extension: this.permittedExtensions },
                languageQuery
            ]
        });

        let books = (await Promise.all([booksByText, booksByIsbn])).flat();
        return books.map(book => new Book(book.id, '', book.title, book.author, book.series, '',
            book.isbn, book.language, book.pubDate, book.extension,
            book.filename, book.coverUrl, 0, '', true));
    }
      
    searchOneColumn(valueList: String[], columnName: LibgenBookColumn) {
        let query: { [Op.or]: any[] } | Literal;
        if (columnName == 'Identifier') {
            query = sql`MATCH (Identifier) AGAINST(${valueList.join(' ')})`;
        } else {
            let searchArray = [];
            valueList.forEach(value => {
                searchArray.push({ [columnName]: {[Op.like]: `%${value}%`} });
            });
            query = { [Op.or]: searchArray }
        }        
        
        return FictionBook.findAll({
            where: [
                query,
                { Visible: { [Op.ne]: 'no' } },
                { Extension: this.permittedExtensions }
            ],
            group: ['Title', 'Language']
        });
    }

    async localSearchOneColumn(valueList: String[], columnName: ReadarrBookColumn) {
        let searchArray = [];
        valueList.forEach(value => {
            searchArray.push({ [columnName]: {[Op.like]: `%${value}%`} });
        });
        let query = { [Op.or]: searchArray }

        let readarrBooks = await ReadarrBook.findAll({
            where: [
                query,
                { extension: this.permittedExtensions }
            ],
            group: ['title', 'language']
        });

        return readarrBooks.map(readarrBook => { 
            let book = new FictionBook();
            book.Title = readarrBook.title;
            book.Author = readarrBook.author;
            
        })
    }

    searchMultiColumn(valueList: Object[], ...columnNames: LibgenBookColumn[]) {
        let searchArray = [];
        valueList.forEach(value => {
            let search = [];
            let i = 0;
            columnNames.forEach(columnName => {
                search.push({ [columnName]: {[Op.like]: `%${value[Object.keys(value)[i]]}%`}})
                i++;
            })
            searchArray.push({ [Op.and]: search });
        })
        return FictionBook.findAll({
            where: {
                [Op.or]: searchArray,
                Visible: { [Op.ne]: 'no' },
                Extension: this.permittedExtensions
            },
            group: ['Title', 'Language']
        });  
    }

    async getParam(param: string): Promise<string> {
        return (await LibgenParams.findOne({ where: { name: param } })).value
    }

    updateHostIp(hostIp: string): void {
        LibgenParams.update({ value: hostIp }, { where: { name: this.HOST_IP } });
    }

    static async createLocalBook(book: Book) {
        book.isbn = book.isbn;
        try {
            await ReadarrBook.create(book);
        } catch (error) {
            console.error('Error saving uploaded book data: ', error);
        }
    }
    
    private static initModels() {
        LibgenParams.init({
            name: {
                type: DataTypes.STRING,
                primaryKey: true,
                unique: true
            },
            value: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, { sequelize: this.sequelize });

        initLibgenBookModel(this.sequelize);
        initLibgenNonFictionBookModel(this.sequelize);
        initReadarrBookModel(this.sequelize);
    }

    private libgenToReadarrColumn(libgenBookColumn: LibgenBookColumn): ReadarrBookColumn {
        switch (libgenBookColumn) {
            case 'Identifier':
                return 'isbn'
            case 'Title':
                return 'title'
            case 'Author':
                return 'author'
            default:
                return;
        }
    }

}