import { Readable } from "stream";

export class BookBlob {
    data: Readable;
    filename: string;
    filePath: string;

    constructor(data: Readable, filename: string, filePath: string = '') {
        this.data = data;
        this.filename = filename;
        this.filePath = filePath;
    }
}