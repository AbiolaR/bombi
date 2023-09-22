//const { Sequelize, Op } = require('sequelize');
import { Sequelize, Op, Model, DataTypes } from "sequelize";
const { DEC } = require('./secman');
//const { Book } = require('../models/book.model');
import { Book } from "../models/db/book.model";
import { LibgenParams } from "../models/db/libgen-params.model";
//const { BookModel } = require('../models/book.model');

export class LibgenDbService {
    private db: Sequelize;
    private book: any;

    constructor() {
        this.initDB();
    }

    private initDB() {
        this.db = new Sequelize(
            DEC('U2FsdGVkX19Rdz0oa5ZdqlLSp24hoiVyC7T5LHFAxH4='), // DB name
            DEC('U2FsdGVkX1+C3L9Ljwi4EbDVss0tzXyRMShvEiQASCk='), // username
            DEC('U2FsdGVkX1/UuKxHGBGj1ote/c3ZTCh8iOeJZPFqSpo='), // password
            {
                host: DEC('U2FsdGVkX1+05Zg5oW8quqoZqd7gvSrRAt+EPn4DRpY='),
                dialect: DEC('U2FsdGVkX1+owrCFwZIw+8WDF1hZTPAc1je+z9tlfnc=')
            }
            );
            
        this.db.authenticate().then(() => {
            console.info('Connection has been established successfully.');
        }).catch((error) => {
            console.error('Unable to connect to the database: ', error);
        });
        
        this.book = Book(this.db);
        this.defineModel();

        this.searchMultiISBN(['9781668002537', '9781250159014', '9780374311544', '9781481497619', '9780316480772', '9798886439298']).then((results) => {
            results.forEach(result => {
                console.log(result.dataValues.Title);
            });
        });
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
        }, { sequelize: this.db });
    }

}