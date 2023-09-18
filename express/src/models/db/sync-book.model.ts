import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class SyncBook extends Model<InferAttributes<SyncBook>, InferCreationAttributes<SyncBook>> {
    declare isbn: number;
    declare title: string;
    declare author: string;
    declare pubDate: Date;
    
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export interface SyncBookModel {
    isbn: number;
    title: string;
    author: string;
    pubDate: Date;
}