import { SyncLanguage } from "./sync-language.model";
import { SyncStatus } from "./sync-status.model";

export class SyncRequest {
    username: string;
    isbn: string;
    title: string;
    author: string;
    pubDate: Date;
    status: SyncStatus;
	language: SyncLanguage;
	asin: string;
	md5Hash: string;
    downloadUrl: string;
    coverUrl: string;

	constructor(username: string, isbn: string, title: string, author: string, pubDate: Date, 
		status: SyncStatus, language: SyncLanguage = SyncLanguage.ENGLISH, asin: string = '', 
		md5Hash: string = '', downloadUrl: string = '', coverUrl: string = '') {
		this.username = username;
		this.isbn = isbn;
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.status = status;
		this.language = language;
		this.asin = asin;
		this.md5Hash = md5Hash;
		this.downloadUrl = downloadUrl;
		this.coverUrl = coverUrl;
	}
    
}