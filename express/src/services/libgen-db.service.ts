//const { Sequelize, Op } = require('sequelize');
import { Sequelize, Op, Model, DataTypes } from "sequelize";
const { DEC } = require('./secman');
//const { Book } = require('../models/book.model');
import { Book } from "../models/db/book.model";
import { LibgenParams } from "../models/db/libgen-params.model";
//const { BookModel } = require('../models/book.model');

export class LibgenDbService {
    private sequelize: Sequelize;
    private book: any;
    private HOST_IP = 'host_ip';    

    constructor() {
        this.initDB();
    }

    private initDB() {
        console.log('about to assign sequelize')
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
        console.log('done with assigning sequelize')            
        
        this.sequelize.authenticate().then(() => {
            this.book = Book(this.sequelize);
            this.defineModel();
            this.sequelize.sync();
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });
        
            //return this;                
    }

    async sync() {
        return this.sequelize.sync();
    }

    async isConnected() {
        return this.sequelize.authenticate();
    }
      
    async searchMultiISBN(isbnList: String[]) {
        let searchArray = [];
        isbnList.forEach(isbn => {
            searchArray.push({ Identifier: {[Op.like]: `%${isbn}%`} });
        })
        return await this.book.findAll({
            where: {
                [Op.or]: searchArray
            }    
        });  
    }

    async getParam(param: string): Promise<string> {
        return (await LibgenParams.findOne({ where: { name: param } })).value
    }

    updateHostIp(hostIp: string): void {
        LibgenParams.update({ value: hostIp }, { where: { name: this.HOST_IP } });
    }
    
    private defineModel() {
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

        /*LibgenParams.bulkCreate([
            { name: 'host_ip', value: '176.119.25.72'},
            { name: 'test_hash', value: '802D6390F04E39EF3D0C3BBF6678A2CD'}
        ]);*/
    }

}