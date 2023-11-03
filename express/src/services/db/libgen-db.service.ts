import { Sequelize, Op, DataTypes } from "sequelize";
import { LibgenParams } from "../../models/db/mysql/libgen-params.model";
import { initBook } from "../../models/db/mysql/book.model.init";
import { LibgenBook, LibgenBookColumn } from "../../models/db/mysql/libgen-book.model";
import { DEC } from '../secman';
import { Book } from "../../models/db/book.model";

export class LibgenDbService {
    private static sequelize: Sequelize;
    private readonly SEARCH_LIMIT = 100;
    private readonly HOST_IP = 'host_ip';
    private readonly permittedExtensions = ['epub'];

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
        await this.sequelize.sync();      
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
            where: [
                Sequelize.literal(`MATCH (title, author, series) AGAINST('${searchString}' IN BOOLEAN MODE)`),
                { Visible: { [Op.ne]: 'no' } },
                { Extension: this.permittedExtensions },
                languageQuery
            ], 
            limit: this.SEARCH_LIMIT,
            offset: (page - 1) * 100,
            order: [['Filesize', 'DESC']]
        });

        let booksByIsbn = LibgenBook.findAll({
            where: [
                Sequelize.literal(`MATCH (identifier) AGAINST('${searchString}')`),
                { Visible: { [Op.ne]: 'no' } },
                { Extension: this.permittedExtensions },
                languageQuery
            ], 
            limit: this.SEARCH_LIMIT,
            offset: (page - 1) * 100,
            order: [['Filesize', 'DESC']]
        });
        
        let books = (await Promise.all([booksByText, booksByIsbn])).flat();
        return books.map(book => new Book(book.ID, book.MD5, book.Title, book.Author, book.Series,
            book.Identifier.split(',')[0], book.Language, book.Year, book.Extension,
            `${book.Title}.${book.Extension}`, book.Coverurl));
    }
      
    searchOneColumn(valueList: String[], columnName: LibgenBookColumn) {
        let searchArray = [];
        valueList.forEach(value => {
            searchArray.push({ [columnName]: {[Op.like]: `%${value}%`} });
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

        initBook(this.sequelize);
    }

}