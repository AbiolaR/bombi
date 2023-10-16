import { SocialReadingPlatform } from "./social-reading-platform";
import { SyncLanguage } from "./sync-language.model";
import { SyncStatus } from "./sync-status.model";

export class SyncRequest {
    username: string;
    isbn: string;
    title: string;
    author: string;
    pubDate: Date;
    status: SyncStatus;
	platform: SocialReadingPlatform;
	language: SyncLanguage;
	asin: string;
	creationDate: Date;
	md5Hash: string;
    downloadUrl: string;
    coverUrl: string;

	constructor(username: string, isbn: string, title: string, author: string, pubDate: Date, 
		status: SyncStatus, platform: SocialReadingPlatform, 
		language: SyncLanguage = SyncLanguage.ENGLISH, asin: string = '', creationDate: Date = new Date(), 
		md5Hash: string = '', downloadUrl: string = '', coverUrl: string = '') {
		this.username = username;
		this.isbn = isbn;
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.status = status;
		this.platform = platform;
		this.language = language;
		this.asin = asin;
		this.creationDate = creationDate;
		this.md5Hash = md5Hash;
		this.downloadUrl = downloadUrl;
		this.coverUrl = coverUrl;
	}
    
}