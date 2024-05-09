import axios from "axios";
import { saveToDiskAsync } from "../tools";
import { sendFileViaEmail } from "../email";
import { upload } from "../tolinoman";
import { User } from "../../models/db/mongodb/user.model";
import { BookBlob } from "../../models/book-blob.model";
import { BookDownloadResponse as BookDownloadResponse } from "../../models/book-download-response.model";
import { Readable } from "stream";
import { CoverBlob } from "../../models/cover-blob.model";
import { Book } from "../../models/db/book.model";
import { createReadStream, existsSync } from "fs";
import { dirname } from "path";
import { PocketBookCloudService } from "../e-readers/pocketbook-cloud.service";

export class BookService {

  private static readonly LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'http://libgen.rocks';
  private static readonly BASE_DOWNLOAD_URL = 'https://download.library.lol';
  private static readonly FICTION_DOWNLOAD_URL = `${this.BASE_DOWNLOAD_URL}/fiction/`;
  private static readonly NON_FICTION_DOWNLOAD_URL = `${this.BASE_DOWNLOAD_URL}/main/`;
  private static readonly LIBGEN_COVERS = 'https://library.lol/';
  private static readonly SPLIT = '._-_.';

  static async download(book: Book): Promise<BookDownloadResponse> {
    if (!book.md5) {
      return await this.fetchFromLocal(book);
    }
    let series = book.series ? `(${book.series})` : '';
    let downloadUrl = '';
    if (book.coverUrl.startsWith('/fictioncover')) {
      downloadUrl = this.FICTION_DOWNLOAD_URL + this.encodeUriAll(`${this.torrentNumber(book)}/${book.md5}.${book.extension}/${series} ${book.author} - ${book.title}.${book.extension}`);
    } else {
      downloadUrl = this.NON_FICTION_DOWNLOAD_URL + this.encodeUriAll(`${this.torrentNumber(book)}/${book.md5}/${series} ${book.author} - ${book.title}-${book.publisher}.${book.extension}`);
    }
    let coverUrl = book.coverUrl.replace(/\/.*covers\//, '') ? `${this.LIBGEN_COVERS}${book.coverUrl}` : '';
    book.coverUrl = coverUrl;

    return await this.fetchFromLocal(book) 
      || await this.downloadWithUrl(downloadUrl, coverUrl, `${book.md5}${this.SPLIT}${book.filename}`)
      || await this.downloadWithMD5(book.md5, coverUrl, `${book.md5}${this.SPLIT}${book.filename}`);
  }

  static async downloadWithUrl(url: string, coverUrl: string, filename: string): Promise<BookDownloadResponse> {
      try {
        const request = await axios.get<Readable>(url, {
          responseType: 'stream',
        });
        let cover = new CoverBlob();
        if (coverUrl) {
          const coverRequest = await axios.get<Readable>(coverUrl, { responseType: 'stream' });
          cover = new CoverBlob(coverRequest.data, coverRequest.config.url.split('/').pop());
        }
        return new BookDownloadResponse(new BookBlob(request.data, filename), cover);
      } catch (error) {
        console.error(error)
      }
  }

  static async downloadWithMD5(md5Hash: string, coverUrl: string, filename: string): Promise<BookDownloadResponse> {
    try {
      const page = (await axios.get<string>(`${this.LIBGEN_MIRROR}/ads.php?md5=${md5Hash}`)).data;
      const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);

      let downloadUrl = page.match(regexDownloadURL).toString();

      const request = await axios.get<Readable>(`${downloadUrl}`, { 
        responseType: 'stream'
      });

      let book = new BookBlob(request.data, filename);

      let cover = new CoverBlob();
      if (coverUrl) {
        const coverRequest = await axios.get<Readable>(coverUrl, { responseType: 'stream' });
        cover = new CoverBlob(coverRequest.data, coverRequest.config.url.split('/').pop());
      }
      
      return new BookDownloadResponse(book, cover);
    } catch(error) {
      console.error(error)
    }
  }

  private static async fetchFromLocal(book: Book): Promise<BookDownloadResponse> {
    try {
      let prefix = '';
      if (book.md5) {
        prefix = book.md5 + this.SPLIT;
      }
      let filePath = `/tmp/app.bombi/${prefix}${book.filename}`;      
      if(!existsSync(filePath)) return

      let coverPath = '';
      if (!book.md5) {
        coverPath = `${dirname(require.main.filename)}/../static${book.coverUrl}`;
      } else {
        coverPath = `/tmp/app.bombi/${book.coverUrl.split('/').pop()}`
      }

      let downloadResponse = new BookDownloadResponse(
        new BookBlob(createReadStream(filePath), book.filename.split('/').pop(), filePath)
      );

      let cover = new CoverBlob();
      if (book.coverUrl) {
        let data: Readable;
        if (existsSync(coverPath)) {
          data = createReadStream(coverPath);
        } else {
          data = (await axios.get<Readable>(book.coverUrl, { responseType: 'stream' })).data;
          coverPath = '';
        }
        cover = new CoverBlob(data, book.coverUrl.split('/').pop(), coverPath);
      }
      downloadResponse.cover = cover;

      return downloadResponse;
    } catch(error) {
      console.error(error);
    }
  }

  static async sendFileToKindle(recipient: string, book: BookBlob) {
    book.filePath = book.filePath || await saveToDiskAsync(book.data, book.filename);
    return await sendFileViaEmail(recipient, book.filePath, book.filename.split(this.SPLIT).pop());
  }

  static async sendFileToTolino(book: BookBlob, cover: CoverBlob, user: User) {
      book.filePath = book.filePath || await saveToDiskAsync(book.data, book.filename);      

      if (cover.data && !cover.filePath) {
        cover.filePath =  await saveToDiskAsync(cover.data, cover.filename);
      }
    
      const result = await upload(book.filePath, cover.filePath, user);
    
      if (result.command && result.refresh_token) {
        return { status: 200, message: { success: 'file sent to tolino' } };
      } else {
        return { status: 501, message: { error: 'file not sent to tolino' } };
      }
  }

  static async sendFileToPocketBook(book: BookBlob, user: User) {
    const success = await PocketBookCloudService.uploadBook(user, book);

    if (success) {
      return { status: 200, message: { success: 'file sent to pocketbook' } };
    } else {
      return { status: 501, message: { error: 'file not sent to pocketbook' } };
    }
  }

  private static encodeUriAll(value: string): string {
    return value.replace(/[^A-Za-z0-9/.]/g, c =>
      `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    ).toLowerCase();
  }

  private static torrentNumber(book: Book): number {
    return Math.floor(book.id / 1000) * 1000;
  }
}