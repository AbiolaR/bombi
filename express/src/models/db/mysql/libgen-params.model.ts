import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";

export class LibgenParams extends Model<InferAttributes<LibgenParams>, InferCreationAttributes<LibgenParams>> {
    declare name: string;
    declare value: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}