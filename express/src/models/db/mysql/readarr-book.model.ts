import { InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";

export class ReadarrBook extends Model<InferAttributes<ReadarrBook>, InferCreationAttributes<ReadarrBook>> {
    declare id: number;
    declare title: string;
    declare author: string;
    declare series: string;
    declare language: string;
    declare year: string;
    declare isbn: string;
    declare coverUrl: string;
    declare extension: string;
    declare filename: string;
}