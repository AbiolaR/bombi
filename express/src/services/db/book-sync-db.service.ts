import { DataTypes, Op, Sequelize } from "sequelize";
import { DEC } from "../secman";
import { SyncBook } from "../../models/db/mysql/sync-book.model";
import { SyncUser } from "../../models/db/mysql/sync-user.model";
import { SyncRequest } from "../../models/sync-request.model";
import { SyncStatus } from "../../models/sync-status.model";
import { SocialReadingPlatform } from "../../models/social-reading-platform";

export class BookSyncDbService {
    private static sequelize: Sequelize;

    constructor() {}

    async findSyncRequests(username: string, syncRequests: SyncRequest[], syncStatus: SyncStatus): Promise<SyncRequest[]> {
        let isbns = syncRequests.map((syncRequest) => syncRequest.isbn);
        let titles = syncRequests.map((syncRequest) => syncRequest.title);
        let authors = syncRequests.map((syncRequest) => syncRequest.author);
        let platforms = syncRequests.map(syncRequest => syncRequest.platform);

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

        let statusRestrict = {};
        if (syncStatus) {
            statusRestrict = { status: syncStatus };
        }
        let usernameRestrict = {};
        if (username) {
            usernameRestrict = { username: username };
        }
        let bookSearchArray = [];
        if (!!syncRequests.length) {
            bookSearchArray = [
                { [Op.or]: isbnSearchArray },
                { [Op.or]: titleSearchArray },
                { [Op.or]: authorSearchArray },                   
            ]
        }
        let platformRestrict = {};
        if(!!syncRequests.length) {
            platformRestrict = { platform: platforms };
        }

        let result = await SyncUser.findAll({
            where: {
                [Op.and]: [
                    usernameRestrict,
                    statusRestrict,
                    platformRestrict
                ]
            },
            include: [
                { model: SyncBook, required: true, as: 'syncBook',
                    where: {
                        [Op.and]: bookSearchArray
                    }
                }
            ]
        });

        return result.map((syncUser) => new SyncRequest(syncUser.username, syncUser.syncBook.isbn, 
                syncUser.syncBook.title, syncUser.syncBook.author, syncUser.syncBook.pubDate, 
                syncUser.status, syncUser.platform, syncUser.syncBook.language, syncUser.syncBook.asin));
    }

    async createSyncRequest(syncRequest: SyncRequest): Promise<void> {
        try {
            let book = await SyncBook.upsert({
                    isbn: syncRequest.isbn,
                    title: syncRequest.title,
                    author: syncRequest.author,
                    language: syncRequest.language,
                    asin: syncRequest.asin,
                    pubDate: syncRequest.pubDate
                });
            await SyncUser.findOrCreate({
                where: {
                    username: syncRequest.username,
                    syncBookId: book[0].dataValues.id,
                    platform: syncRequest.platform
                }, 
                defaults: {
                    status: syncRequest.status,
                    username: syncRequest.username,
                    syncBookId: book[0].dataValues.id,
                    platform: syncRequest.platform
                }, 
            });
        } catch (error) {
            console.error(error)
        }
    }

    deleteSyncRequests(username: string, platform: SocialReadingPlatform) {
        try {
            SyncUser.destroy({
                where: {
                    username: username,
                    platform: platform
                }
            })
        } catch(error) {
            console.error(error);
        }
    }

    updateSyncStatus(syncRequest: SyncRequest, syncStatus: SyncStatus) {
        try {
            SyncBook.findOne({
                where: {
                    isbn: syncRequest.isbn,
                    title: syncRequest.title,
                    author: syncRequest.author,
                    asin: syncRequest.asin,
                    language: syncRequest.language
                }
            }).then((book) => {
                if (book?.id) {
                    SyncUser.update({
                        status: syncStatus
                    }, { where: { username: syncRequest.username, syncBookId: book.id, platform: syncRequest.platform } });
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async bulkUpdateSyncStatus(syncRequests: SyncRequest[], syncStatus: SyncStatus) {
        let usernames = syncRequests.map(syncRequest => syncRequest.username);
        let isbns = syncRequests.map(syncRequest => syncRequest.isbn);
        let titles = syncRequests.map(syncRequest => syncRequest.title);
        let authors = syncRequests.map(syncRequest => syncRequest.author);
        let asins = syncRequests.map(syncRequest => syncRequest.asin);
        let languages = syncRequests.map(syncRequest => syncRequest.language);
        let platforms = syncRequests.map(syncRequest => syncRequest.platform);
        
        try {
            let books = await SyncBook.findAll({
                where: {
                    isbn: isbns,
                    title: titles,
                    author: authors,
                    asin: asins,
                    language: languages
                }
            });
            if (books) {
                let bookIds = books.map(book => book.id);
                await SyncUser.update({
                    status: syncStatus
                }, { where: { username: usernames, syncBookId: bookIds, platform: platforms } });
            }

        } catch (error) {
            console.error(error);
        }
    }

    updateDownloadData(syncRequests: SyncRequest[]) {
        try {
            syncRequests.forEach(syncRequest => {
                SyncBook.update({
                    md5Hash: syncRequest.md5Hash,
                    downloadUrl: syncRequest.downloadUrl,
                    coverUrl: syncRequest.coverUrl
                }, { where: {
                    isbn: syncRequest.isbn,
                    title: syncRequest.title,
                    author: syncRequest.author,
                    language: syncRequest.language,
                    asin: syncRequest.asin
                }}).then(() => {
                    this.updateSyncStatus(syncRequest, syncRequest.status);
                });
            });
        } catch (error) {
            console.error(error);
        }
    }


    public static async initDB() {
        let dbName = DEC('U2FsdGVkX1+lkXTvf4XJbnAZmv+O8eMkZ1mzDGaWoas=');
        let dbUsername = DEC('U2FsdGVkX19IHfihjXuIRi//Wbq7/GhIyMlsEZjuNq0=');
        let dbPassword = DEC('U2FsdGVkX1/gyYD3KK46HjAfLPXVovQlUgOH9NQqUu8=');
        if (process.env.STAGE == 'prod') {
            dbUsername = DEC('');
            dbPassword = DEC('');
        } 
        this.sequelize = new Sequelize(
            dbName,
            dbUsername,
            dbPassword,
            {
                host: DEC('U2FsdGVkX1+05Zg5oW8quqoZqd7gvSrRAt+EPn4DRpY='),
                dialect: DEC('U2FsdGVkX1+owrCFwZIw+8WDF1hZTPAc1je+z9tlfnc='),
                timezone: '+02:00',
                logging: false
            },
            );
            
        await this.sequelize.authenticate();
        this.defineModels();
        await this.sequelize.sync({alter: true});
    }

    private static defineModels() {    
        let syncBook = SyncBook.init({
            id: {
                primaryKey: true,
                type: DataTypes.INTEGER,
                unique: 'id',
                autoIncrement: true
            },
            isbn: {
                type: DataTypes.STRING,
                unique: 'isbn'
            },
            asin: {
                type: DataTypes.STRING,
                unique: 'asin'
            },
            language: {
                type: DataTypes.STRING,
                primaryKey: true,
                unique: 'language'
            },
            md5Hash: { 
                type: DataTypes.STRING,
                unique: 'md5Hash'
            },
            title: DataTypes.STRING,
            author: DataTypes.STRING,
            pubDate: DataTypes.DATE,            
            downloadUrl: DataTypes.STRING,
            coverUrl: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
        }, 
        { sequelize: this.sequelize }
        );
        let syncUser = SyncUser.init({
            username: { 
                type: DataTypes.STRING,
                primaryKey: true
            },
            platform: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            status: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        { sequelize: this.sequelize }
        );
        syncBook.hasMany(syncUser, { foreignKey: 'syncBookId', onDelete: 'RESTRICT' });
        syncUser.belongsTo(syncBook,
            { as: 'syncBook', foreignKey: {name: 'syncBookId'}, onDelete: 'RESTRICT' });
    }
}