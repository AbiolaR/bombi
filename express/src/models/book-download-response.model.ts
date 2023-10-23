import { BookBlob } from "./book-blob.model";
import { CoverBlob } from "./cover-blob.model";

export class BookDownloadResponse {
    book: BookBlob;
    cover: CoverBlob;

    constructor(book: BookBlob, cover = undefined) {
        this.book = book;
        this.cover = cover;
    }
}