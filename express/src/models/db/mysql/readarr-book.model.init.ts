import Sequelize, { DataTypes } from "@sequelize/core";
import { ReadarrBook } from "./readarr-book.model";

export const initReadarrBookModel = (sequelize: Sequelize) => {
    ReadarrBook.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        title: DataTypes.STRING,
        author: DataTypes.STRING,
        series: DataTypes.STRING,
        coverUrl: DataTypes.STRING,
        year: DataTypes.INTEGER,
        language: DataTypes.STRING,
        extension: DataTypes.STRING,
        filename: DataTypes.STRING,
        isbn: DataTypes.STRING
    }, { sequelize: sequelize, timestamps: false, tableName: 'readarr' });
}