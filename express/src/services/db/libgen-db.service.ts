import { Sequelize, Op, DataTypes, sql, Literal, col } from "@sequelize/core";
import { LibgenParams } from "../../models/db/mysql/libgen-params.model";
import { initLibgenBookModel } from "../../models/db/mysql/libgen-book.model.init";
import { LibgenBook, LibgenBookColumn } from "../../models/db/mysql/libgen-book.model";
import { DEC } from '../secman';
import { Book } from "../../models/db/book.model";
import { initReadarrBookModel } from "../../models/db/mysql/readarr-book.model.init";
import { ReadarrBook } from "../../models/db/mysql/readarr-book.model";

export class LibgenDbService {
    private static sequelize: Sequelize;
    private readonly SEARCH_LIMIT = 50;
    private readonly HOST_IP = 'host_ip';
    private readonly permittedExtensions = ['epub'];
    private readonly fulltextIndexes = ['Title', 'Author', 'Series', 'Identifier'];

    constructor() {}

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
        
        await this.sequelize.authenticate();
        this.initModels();
    }

    async indexedSearch(searchString: string, page: number): Promise<Book[]> {
        let language = searchString.split('lang:')[1];
        let languageQuery = {};
        if (language) {
            languageQuery = { Language: language };
            searchString = searchString.replace('lang:' + language, '');
        }
        searchString = searchString.split(' ').map(word => `+${word}`).join(' ');
        
        let booksByText = LibgenBook.findAll({
            attributes: {
                include: [
                    [sql`(1.3 * (MATCH(series) AGAINST (${searchString} IN BOOLEAN MODE))
                    + (1 * (MATCH(title) AGAINST (${searchString} IN BOOLEAN MODE)))
                    + (0.6 * (MATCH(author) AGAINST (${searchString} IN BOOLEAN MODE))))`, 'relevance']
                ]
            },
            where: [
                sql`MATCH (title, author, series) AGAINST(${searchString} IN BOOLEAN MODE)`,
                { Visible: { [Op.ne]: 'no' } },
                { Extension: this.permittedExtensions },
                languageQuery
            ],
            order: [['relevance', 'DESC']]
        });

        let booksByIsbn = LibgenBook.findAll({
            where: [
                sql`MATCH (identifier) AGAINST(${searchString})`,
                { Visible: { [Op.ne]: 'no' } },
                { Extension: this.permittedExtensions },
                languageQuery
            ]
        });
        
        let offset = (page - 1) * this.SEARCH_LIMIT;
        let limit = offset + this.SEARCH_LIMIT;
        let books = (await Promise.all([booksByText, booksByIsbn])).flat().slice(offset, limit);

        let localBooks = []
        if (page == 1) {
            localBooks = await this.indexedLocalSearch(searchString, languageQuery);
        }

        return localBooks.concat(books.map(book => new Book(book.ID, book.MD5, book.Title, book.Author, book.Series,
            book.Identifier.split(',')[0], book.Language, book.Year, book.Extension,
            `${book.Title}.${book.Extension}`, book.Coverurl)));
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
        return books.map(book => new Book(book.id, '', book.title, book.author, book.series,
            book.isbn, book.language, book.year, book.extension,
            book.filename, book.coverUrl));
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
        
        return LibgenBook.findAll({
            where: [
                query,
                { Visible: { [Op.ne]: 'no' } },
                { Extension: this.permittedExtensions }
            ],
            group: ['Title', 'Language']
        });
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
        return LibgenBook.findAll({
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
        initReadarrBookModel(this.sequelize);
    }

}