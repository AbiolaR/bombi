import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import { SyncLanguage } from '../../sync-language.model';

export class SyncBook extends Model<InferAttributes<SyncBook>, InferCreationAttributes<SyncBook>> {
    declare isbn: string;
    declare asin: string;
    declare title: string;
    declare author: string;
    declare language: SyncLanguage;
    declare pubDate: Date;
    declare md5Hash: string;
    declare downloadUrl: string;
    declare coverUrl: string;
    
    declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

export type SyncBookProperty = 
| 'isbn'
| 'asin'
| 'title'
| 'author'
| 'language'
| 'pubDate'
| 'md5Hash'
| 'downloadUrl'
| 'coverUrl'
| 'id'
| 'createdAt'
| 'updatedAt'