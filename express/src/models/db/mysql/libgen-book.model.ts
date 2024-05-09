import { InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";
import { BookType } from "../../book-type.enum";

export class LibgenBook extends Model<InferAttributes<LibgenBook>, InferCreationAttributes<LibgenBook>> {
    declare ID: number;
    declare MD5: string;
    declare Title: string;
    declare Author: string;
    declare Series: string;
    declare Edition: string;
    declare Language: string;
    declare Year: string;
    declare Publisher: string;
    declare Pages: string;
    declare Identifier: string;
    declare GooglebookID: string;
    declare ASIN: string;
    declare Coverurl: string;
    declare Extension: string;
    declare Filesize: number;
    declare Library: string;
    declare Issue: string;
    declare Locator: string;
    declare Commentary: string;
    declare Generic: string;
    declare Visible: string;
    declare TimeAdded: Date;
    declare TimeLastModified: Date;
    declare Booktype: BookType;
}

export class FictionBook extends LibgenBook {}
export class NonFictionBook extends LibgenBook {}

export type LibgenBookColumn = 
    | 'ID'
    | 'MD5'
    | 'Title'
    | 'Author'
    | 'Series'
    | 'Edition'
    | 'Language'
    | 'Year'
    | 'Publisher'
    | 'Pages'
    | 'Identifier'
    | 'GooglebookID'
    | 'ASIN'
    | 'Coverurl'
    | 'Extension'
    | 'Filesize'
    | 'Library'
    | 'Issue'
    | 'Locator'
    | 'Commentary'
    | 'Generic'
    | 'Visible'
    | 'TimeAdded'
    | 'TimeLastModified'    