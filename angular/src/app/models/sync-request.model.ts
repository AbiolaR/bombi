import { SocialReadingPlatform } from "./social-reading-platform";
import { SyncStatus } from "./sync-status.model";

export class SyncRequest {
    username: string;
    isbn: string;
    title: string;
    author: string;
    pubDate: Date;
    status: SyncStatus;
	platform: SocialReadingPlatform;

	constructor(username: string, isbn: string, title: string, author: string, pubDate: Date, 
		status: SyncStatus, platform: SocialReadingPlatform) {
		this.username = username;
		this.isbn = isbn;
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.status = status;
		this.platform = platform;
	}
    
}