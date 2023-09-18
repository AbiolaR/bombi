import { DataTypes, Sequelize } from "sequelize";
import { DEC } from "./secman";
import { SyncBook } from "../models/db/sync-book.model";
import { SyncUser } from "../models/db/sync-user.model";
import { SyncRequest } from "../models/sync-request.model";
import { SyncStatus } from "../models/sync-status.model";

export class BookSyncService {
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
        this.initDB();
    }

    createSyncUser(syncRequest: SyncRequest) {
        SyncBook.upsert({
            isbn: syncRequest.$isbn,
            title: syncRequest.$title,
            author: syncRequest.$author,
            pubDate: syncRequest.$pubDate
        }).then(() => {
            SyncUser.upsert({
                status: syncRequest.$status,
                username: syncRequest.$username,
                syncBookIsbn: syncRequest.$isbn 
            });
        });
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
            
        this.sequelize.authenticate().then(() => {
            this.defineModels();
            this.sequelize.sync();
            
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });        
    }

    private defineModels() {    
        this.syncBook = SyncBook.init({
            isbn: {
                primaryKey: true,
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
        this.syncBook.hasMany(this.syncUser, { foreignKey: 'syncBookIsbn', onDelete: 'RESTRICT' });
        this.syncUser.belongsTo(this.syncBook,
            { as: 'syncBook', foreignKey: {name: 'syncBookIsbn', primaryKey: true}, onDelete: 'RESTRICT' });
    }
}