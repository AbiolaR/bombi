import { Sequelize, Op, DataTypes } from "sequelize";
//import { Book } from "../../models/db/book.model.init";
import { LibgenParams } from "../../models/db/libgen-params.model";
import { initBook } from "../../models/db/book.model.init";
import { LibgenBook, LibgenBookColumn } from "../../models/db/libgen-book.model";
const { DEC } = require('../secman');

export class LibgenDbService {
    private sequelize: Sequelize;
    private HOST_IP = 'host_ip';
    private permittedExtensions = ['epub']

    constructor() {
        this.initDB();
    }

    private initDB() {
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
        
        this.sequelize.authenticate().then(() => {
            //this.book = Book(this.sequelize);
            this.initModels();
            this.sequelize.sync();
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });
        
            //return this;                
    }
      
    searchMulti(valueList: String[], columnName: LibgenBookColumn) {
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
            group: ['Title']
        });  
    }

    async getParam(param: string): Promise<string> {
        return (await LibgenParams.findOne({ where: { name: param } })).value
    }

    updateHostIp(hostIp: string): void {
        LibgenParams.update({ value: hostIp }, { where: { name: this.HOST_IP } });
    }
    
    private initModels() {
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