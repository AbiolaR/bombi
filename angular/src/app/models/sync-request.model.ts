import { SyncStatus } from "./sync-status.model";

export class SyncRequest {
    username: string;
    isbn: string;
    title: string;
    author: string;
    pubDate: Date;
    status: SyncStatus;

	constructor(username: string, isbn: string, title: string, author: string, pubDate: Date, status: SyncStatus) {
		this.username = username;
		this.isbn = isbn;
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.status = status;
	}
    
}