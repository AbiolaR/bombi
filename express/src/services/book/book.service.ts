import axios from "axios";
import { convertToMobiAsync, saveToDiskAsync } from "../tools";
import { sendFileToKindle } from "../email";
import { upload } from "../tolinoman";
import { User } from "../../models/db/mongodb/user.model";
import { BookBlob } from "../../models/book-blob.model";
import { BookDownloadResponse as BookDownloadResponse } from "../../models/book-download-response.model";
import { Readable } from "stream";
import { CoverBlob } from "../../models/cover-blob.model";

export class BookService {

  private static readonly LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'https://libgen.rocks';

  static async downloadWithUrl(url: string, coverUrl: string): Promise<BookDownloadResponse> {
      try {
        const request = await axios.get<Readable>(url, {
          responseType: 'stream',
        });
        let cover: CoverBlob;
        if (coverUrl) {
        const coverRequest = await axios.get<Readable>(coverUrl, { responseType: 'stream' });
          cover = new CoverBlob(coverRequest.data, coverRequest.config.url.split('/').pop());
        }
        return new BookDownloadResponse(new BookBlob(request.data), cover);
      } catch (error) {
        console.error(error)
      }
  }

  static async downloadWithMD5(md5Hash: string, coverUrl: string): Promise<BookDownloadResponse> {
    try {
      const page = (await axios.get<string>(`${this.LIBGEN_MIRROR}/get.php?md5=${md5Hash}`)).data;
      const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);

      let downloadUrl = page.match(regexDownloadURL).toString();

      let book = new BookBlob((await axios.get<Readable>(`${this.LIBGEN_MIRROR}/${downloadUrl}`, 
        { responseType: 'stream' })).data);

      let cover: CoverBlob;
      if (coverUrl) {
        const coverRequest = await axios.get<Readable>(coverUrl, { responseType: 'stream' });
        cover = new CoverBlob(coverRequest.data, coverRequest.config.url.split('/').pop());
      }
      
      return new BookDownloadResponse(book, cover);
    } catch(error) {
      console.error(error)
    }
  }

  static async prepareAndSendFileToKindle(recipient: string, book: BookBlob) {
      const file = await convertToMobiAsync(book.data, book.filename);
      if (!file.path) return;
      return await sendFileToKindle(recipient, file.path, file.name);
  }
    
  static async sendFileToTolino(book: BookBlob, cover: CoverBlob, user: User) {
      const filePath = await saveToDiskAsync(book.data, book.filename);      
      let coverPath: string;

      if (cover) {
        coverPath = await saveToDiskAsync(cover.data, cover.filename);
      }
    
      const result = await upload(filePath, coverPath, user);
    
      if (result.command && result.refresh_token) {
        return { status: 200, message: { success: 'file sent to tolino' } };
      } else {
        return { status: 501, message: { error: 'file not sent to tolino' } };
      }
  }
}