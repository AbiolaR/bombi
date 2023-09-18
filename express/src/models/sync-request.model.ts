import { SyncStatus } from "./sync-status.model";

export class SyncRequest {
    private username: string;
    private isbn: string;
    private title: string;
    private author: string;
    private pubDate: Date;
    private status: SyncStatus;

	constructor($username: string, $isbn: string, $title: string, $author: string, $pubDate: Date, $status: SyncStatus) {
		this.username = $username;
		this.isbn = $isbn;
		this.title = $title;
		this.author = $author;
		this.pubDate = $pubDate;
		this.status = $status;
	}

    /**
     * Getter $username
     * @return {string}
     */
	public get $username(): string {
		return this.username;
	}

    /**
     * Getter $isbn
     * @return {string}
     */
	public get $isbn(): string {
		return this.isbn;
	}

    /**
     * Getter $title
     * @return {string}
     */
	public get $title(): string {
		return this.title;
	}

    /**
     * Getter $author
     * @return {string}
     */
	public get $author(): string {
		return this.author;
	}

    /**
     * Getter $pubDate
     * @return {Date}
     */
	public get $pubDate(): Date {
		return this.pubDate;
	}

    /**
     * Getter $status
     * @return {SyncStatus}
     */
	public get $status(): SyncStatus {
		return this.status;
	}
    
}