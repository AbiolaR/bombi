//const { Sequelize, Op } = require('sequelize');
import { Sequelize, Op } from "sequelize";
const { DEC } = require('./secman');
//const { Book } = require('../models/book.model');
import { Book as BookModel } from "../models/book.model";
//const { BookModel } = require('../models/book.model');

const db = new Sequelize(
    DEC('U2FsdGVkX19Rdz0oa5ZdqlLSp24hoiVyC7T5LHFAxH4='), // DB name
    DEC('U2FsdGVkX1+C3L9Ljwi4EbDVss0tzXyRMShvEiQASCk='), // username
    DEC('U2FsdGVkX1/UuKxHGBGj1ote/c3ZTCh8iOeJZPFqSpo='), // password
    {
        host: DEC('U2FsdGVkX1+05Zg5oW8quqoZqd7gvSrRAt+EPn4DRpY='),
        dialect: DEC('U2FsdGVkX1+owrCFwZIw+8WDF1hZTPAc1je+z9tlfnc=')
    }
);

db.authenticate().then(() => {
    console.info('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

let Book = BookModel(db)

/*db.sync().then(() => {});*/

async function searchMultiISBN(isbnList: String[]) {
    let searchArray = [];
    isbnList.forEach(isbn => {
        searchArray.push({ Identifier: {[Op.like]: `%${isbn}%`} });
    })
    return await Book.findAll({
        where: {
            [Op.or]: searchArray
        }    
    });  
}

searchMultiISBN(['9781668002537', '9781250159014', '9780374311544', '9781481497619', '9780316480772', '9798886439298']).then((results) => {
    results.forEach(result => {
        console.log(result.dataValues.Title);
    })    
});


module.exports = db;