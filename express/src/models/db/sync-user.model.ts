import { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { SyncBook } from "./sync-book.model";
import { SyncStatus } from "../sync-status.model";
import { SocialReadingPlatform } from "../social-reading-platform";

export class SyncUser extends Model<InferAttributes<SyncUser>, InferCreationAttributes<SyncUser>> {
    declare status: SyncStatus;
    declare username: string;
    declare platform: SocialReadingPlatform;
    declare syncBookId: ForeignKey<number>;

    declare syncBook: CreationOptional<ForeignKey<SyncBook>>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}