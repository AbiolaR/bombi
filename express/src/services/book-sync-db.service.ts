import { DataTypes, Op, Sequelize } from "sequelize";
import { DEC } from "./secman";
import { SyncBook } from "../models/db/sync-book.model";
import { SyncUser } from "../models/db/sync-user.model";
import { SyncRequest } from "../models/sync-request.model";
import { ServerResponse } from "../models/server-response";

export class BookSyncDbService {
    private sequelize: Sequelize;
    private syncBook;
    private syncUser;
    private dbName: string;
    private dbUsername: string;
    private dbPassword: string;

    constructor() {
        const ENV = process.env.STAGE == 'prod' ? 'Prod' : 'Test';
        if (ENV == 'Prod') {
            this.dbUsername = DEC('');
            this.dbPassword = DEC('');
        } else {
            this.dbName = DEC('U2FsdGVkX1+lkXTvf4XJbnAZmv+O8eMkZ1mzDGaWoas=')
            this.dbUsername = DEC('U2FsdGVkX19IHfihjXuIRi//Wbq7/GhIyMlsEZjuNq0=');
            this.dbPassword = DEC('U2FsdGVkX1/gyYD3KK46HjAfLPXVovQlUgOH9NQqUu8=');
        }
        console.log('first');
        this.initDB();
        console.log('sixth');
    }

    async findSyncRequests(username: string, syncRequests: SyncRequest[]): Promise<ServerResponse<SyncRequest[]>> {
        let data = [];
        let isbns = syncRequests.map((syncRequest) => syncRequest.isbn);
        let titles = syncRequests.map((syncRequest) => syncRequest.title);
        let authors = syncRequests.map((syncRequest) => syncRequest.author);

        let isbnSearchArray = [];
        isbns.forEach(isbn => {
            isbnSearchArray.push({ isbn: {[Op.like]: `%${isbn}%`} });
        });
        let titleSearchArray = [];
        titles.forEach(title => {
            titleSearchArray.push({ title: {[Op.like]: `%${title}%`} });
        });
        let authorSearchArray = [];
        authors.forEach(author => {
            authorSearchArray.push({ author: {[Op.like]: `%${author}%`} });
        });

        let result = await SyncUser.findAll({
            where: {
                username: username
            },
            include: [
                { model: SyncBook, required: true, as: 'syncBook',
                    where: {
                        [Op.and]: [
                            { [Op.or]: isbnSearchArray },
                            { [Op.or]: titleSearchArray },
                            { [Op.or]: authorSearchArray },                   
                        ]
                    }
                }
            ]
        });

        data = result.map((syncUser) => new SyncRequest(syncUser.username, syncUser.syncBook.isbn, 
                syncUser.syncBook.title, syncUser.syncBook.author, syncUser.syncBook.pubDate, 
                syncUser.status));
        return new ServerResponse<SyncRequest[]>(data, 0, '');
    }

    createSyncRequest(syncRequest: SyncRequest) {
        try {
            SyncBook.upsert({
                isbn: syncRequest.isbn,
                title: syncRequest.title,
                author: syncRequest.author,
                pubDate: syncRequest.pubDate
            }).then((book) => {
                SyncUser.findOrCreate({
                    where: {
                        username: syncRequest.username,
                        syncBookId: book[0].dataValues.id
                    }, 
                    defaults: {
                        status: syncRequest.status,
                        username: syncRequest.username,
                        syncBookId: book[0].dataValues.id
                    }
                });
            });
        } catch (error) {

        }
    }

    private initDB() {
        this.sequelize = new Sequelize(
            this.dbName,
            this.dbUsername,
            this.dbPassword,
            {
                host: DEC('U2FsdGVkX1+05Zg5oW8quqoZqd7gvSrRAt+EPn4DRpY='),
                dialect: DEC('U2FsdGVkX1+owrCFwZIw+8WDF1hZTPAc1je+z9tlfnc='),
                timezone: '+02:00',
                logging: false
            },
            );
        console.log('second');
            
        this.sequelize.authenticate().then(() => {
            console.log('third');
            this.defineModels();
            this.sequelize.sync();
            console.log('fourth');
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });
        console.log('fifth');
    }

    private defineModels() {    
        this.syncBook = SyncBook.init({
            id: {
                primaryKey: true,
                type: DataTypes.INTEGER,
                unique: true,
                autoIncrement: true
            },
            isbn: {
                type: DataTypes.STRING,
                unique: true
            },
            title: DataTypes.STRING,
            author: DataTypes.STRING,
            pubDate: DataTypes.DATE,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, 
        { sequelize: this.sequelize }
        );
        this.syncUser = SyncUser.init({
            username: { 
                type: DataTypes.STRING,
                primaryKey: true
            },            
            status: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        { sequelize: this.sequelize }
        );
        this.syncBook.hasMany(this.syncUser, { foreignKey: 'syncBookId', onDelete: 'RESTRICT' });
        this.syncUser.belongsTo(this.syncBook,
            { as: 'syncBook', foreignKey: {name: 'syncBookId', primaryKey: true}, onDelete: 'RESTRICT' });
    }
}