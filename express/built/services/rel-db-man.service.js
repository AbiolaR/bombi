"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
//const { Sequelize, Op } = require('sequelize');
var sequelize_1 = require("sequelize");
var DEC = require('./secman').DEC;
//const { Book } = require('../models/book.model');
var book_model_1 = require("../models/db/book.model");
//const { BookModel } = require('../models/book.model');
var db = new sequelize_1.Sequelize(DEC('U2FsdGVkX19Rdz0oa5ZdqlLSp24hoiVyC7T5LHFAxH4='), // DB name
DEC('U2FsdGVkX1+C3L9Ljwi4EbDVss0tzXyRMShvEiQASCk='), // username
DEC('U2FsdGVkX1/UuKxHGBGj1ote/c3ZTCh8iOeJZPFqSpo='), // password
{
    host: DEC('U2FsdGVkX1+05Zg5oW8quqoZqd7gvSrRAt+EPn4DRpY='),
    dialect: DEC('U2FsdGVkX1+owrCFwZIw+8WDF1hZTPAc1je+z9tlfnc=')
});
db.authenticate().then(function () {
    console.info('Connection has been established successfully.');
}).catch(function (error) {
    console.error('Unable to connect to the database: ', error);
});
var Book = (0, book_model_1.Book)(db);
/*db.sync().then(() => {});*/
function searchMultiISBN(isbnList) {
    return __awaiter(this, void 0, void 0, function () {
        var searchArray;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    searchArray = [];
                    isbnList.forEach(function (isbn) {
                        var _a;
                        searchArray.push({ Identifier: (_a = {}, _a[sequelize_1.Op.like] = "%".concat(isbn, "%"), _a) });
                    });
                    return [4 /*yield*/, Book.findAll({
                            where: (_a = {},
                                _a[sequelize_1.Op.or] = searchArray,
                                _a)
                        })];
                case 1: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
/*searchMultiISBN(['9781668002537', '9781250159014', '9780374311544', '9781481497619', '9780316480772', '9798886439298']).then((results) => {
    results.forEach(result => {
        console.log(result.dataValues.Title);
    })
});*/
module.exports = db;
