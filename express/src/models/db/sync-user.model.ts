import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { SyncBook, SyncBookModel } from "./sync-book.model";

export class SyncUser extends Model<InferAttributes<SyncUser>, InferCreationAttributes<SyncUser>> {
    declare status: string;
    declare username: string;
    declare syncBookIsbn: ForeignKey<string>;
    
    //declare id: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}