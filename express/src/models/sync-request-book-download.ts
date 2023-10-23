import { BookDownloadResponse } from "./book-download-response.model";
import { SyncRequest } from "./sync-request.model";

export class SyncRequestBookDownload {
    syncRequest: SyncRequest;
    downloadResponse: BookDownloadResponse;

    constructor(syncRequest: SyncRequest, downloadResponse: BookDownloadResponse) {
        this.syncRequest = syncRequest;
        this.downloadResponse = downloadResponse;
    }
}