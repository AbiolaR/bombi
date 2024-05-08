import { DataTypes, Sequelize } from "@sequelize/core";
import { NonFictionBook } from "./libgen-book.model";

export const initLibgenNonFictionBookModel = (sequelize: Sequelize) => {
    NonFictionBook.init({
        ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        MD5: {
            type: DataTypes.CHAR(32),
            unique: true
        },
        Title: {
            type: DataTypes.STRING(2000),
            allowNull: false
        },
        Author: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        Series: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        Edition: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        Language: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        Year: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        Publisher: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Pages: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        Identifier: {
            type: DataTypes.STRING(400),
            allowNull: false
        },
        GooglebookID: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        ASIN: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        Coverurl: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        Extension: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        Filesize: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Library: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        Issue: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Locator: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        Commentary: {
            type: DataTypes.STRING(500),
        },
        Generic: {
            type: DataTypes.CHAR(32),
            allowNull: false
        },
        Visible: {
            type: DataTypes.CHAR(3),
            allowNull: false
        },
        TimeAdded: {
            type: DataTypes.DATE,
            allowNull: false
        },
        TimeLastModified: {
            type: DataTypes.DATE,
            allowNull: false
        },    
    }, { sequelize: sequelize, timestamps: false, tableName: 'updated' });
}