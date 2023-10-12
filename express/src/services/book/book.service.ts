import axios, { ResponseType } from "axios";
import { SyncRequest } from "../../models/sync-request.model";
import { convertToMobiAsync, saveToDiskAsync } from "../tools";
import { sendFileToKindle } from "../email";
import { upload } from "../tolinoman";

export class BookService {

    static async downloadWithUrl(url: string, coverUrl: string = '') {
        try {
          const request = await axios.get(url, {
            responseType: 'stream',
          });
          return {file: await request.data, cover: {} };
        } catch (err) {
          return {error: `book download failed using url: ${url} |=| ${err}`}
        }
    }

    static async prepareAndSendFileToKindle(recipient: string, data: any, filename: string) {
        const file = await convertToMobiAsync(data, filename);
        if (!file.path) return;
        return await sendFileToKindle(recipient, file.path, file.name);
    }
      
    static async sendFileToTolino(book: any, filename: string, user: any) {
        const filePath = await saveToDiskAsync(book.file, filename);
      
        let coverPath: string;
        if (book.cover && book.cover.file) {
          coverPath = await saveToDiskAsync(book.cover.file, book.cover.name);
        }
      
        const result = await upload(filePath, coverPath, user);
      
        if (result.command && result.refresh_token) {
          return { status: 200, message: { success: 'file sent to tolino' } };
        } else {
          return { status: 501, message: { error: 'file not sent to tolino' } };
        }
    }
}