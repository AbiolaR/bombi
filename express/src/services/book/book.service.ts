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
import { createReadStream } from "fs";
import { dirname } from "path";

export class BookService {

  private static readonly LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'https://libgen.rocks';
  private static readonly BASE_DOWNLOAD_URL = 'https://download.library.lol/fiction/';
  private static readonly LIBGEN_FICTION_COVERS = 'https://library.lol/fictioncovers/';

  static async download(book: Book): Promise<BookDownloadResponse> {
    if (!book.md5) {
      return this.fetchFromLocal(book);
    }
    let series = book.series ? `(${book.series})` : '';

    let downloadUrl = this.BASE_DOWNLOAD_URL + this.encodeUriAll(`${this.torrentNumber(book)}/${book.md5}.${book.extension}/${series} ${book.author} - ${book.title}.${book.extension}`);
    let coverUrl = book.coverUrl ? `${this.LIBGEN_FICTION_COVERS}${book.coverUrl}` : '';

    return await this.downloadWithMD5(book.md5, coverUrl, book.filename)
      || await this.downloadWithUrl(downloadUrl, coverUrl, book.filename);
  }

  static async downloadWithUrl(url: string, coverUrl: string, filename: string): Promise<BookDownloadResponse> {
      try {
        const request = await axios.get<Readable>(url, {
          responseType: 'stream',
        });
        let cover: CoverBlob;
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
      const page = (await axios.get<string>(`${this.LIBGEN_MIRROR}/get.php?md5=${md5Hash}`)).data;
      const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);

      let downloadUrl = page.match(regexDownloadURL).toString();

      const request = await axios.get<Readable>(`${this.LIBGEN_MIRROR}/${downloadUrl}`, { 
        responseType: 'stream'
      });

      let book = new BookBlob(request.data, filename);

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

  private static fetchFromLocal(book: Book): BookDownloadResponse {
    let filePath = `/tmp/app.bombi/books${book.filename}`;
    let coverPath = `${dirname(require.main.filename)}/../static${book.coverUrl}`;
    let downloadResponse = new BookDownloadResponse(new BookBlob(createReadStream(filePath), book.filename.split('/').pop(), filePath));
    if (book.coverUrl) {
      downloadResponse.cover = new CoverBlob(createReadStream(coverPath), book.coverUrl.split('/').pop(), coverPath);
    }
    return downloadResponse;
  }

  static async sendFileToKindle(recipient: string, book: BookBlob) {
    book.filePath = book.filePath || await saveToDiskAsync(book.data, book.filename);
    return await sendFileViaEmail(recipient, book.filePath, book.filename);
  }

  static async sendFileToTolino(book: BookBlob, cover: CoverBlob, user: User) {
      book.filePath = book.filePath || await saveToDiskAsync(book.data, book.filename);      

      if (cover && !cover.filePath) {
        cover.filePath =  await saveToDiskAsync(cover.data, cover.filename);
      }
    
      const result = await upload(book.filePath, cover.filePath, user);
    
      if (result.command && result.refresh_token) {
        return { status: 200, message: { success: 'file sent to tolino' } };
      } else {
        return { status: 501, message: { error: 'file not sent to tolino' } };
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