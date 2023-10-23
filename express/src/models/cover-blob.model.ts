import { Readable } from "stream";

export class CoverBlob {
    data: Readable;
    filename: string;

    constructor(data: Readable, filename: string) {
        this.data = data;
        this.filename = filename;
    }
}