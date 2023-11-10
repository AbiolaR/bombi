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
	creationDate: Date;
	asin: string = '';

	constructor(username: string, isbn: string, title: string, author: string, pubDate: Date, 
		status: SyncStatus, platform: SocialReadingPlatform, language: SyncLanguage, creationDate: Date) {
		this.username = username;
		this.isbn = isbn;
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.status = status;
		this.platform = platform;
		this.language = language;
		this.creationDate = creationDate;
	}
    
}