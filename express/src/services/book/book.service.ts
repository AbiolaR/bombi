import axios, { AxiosError } from "axios";
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
import { DEC } from "../secman";
import { EpubToolsService } from "../epub-tools.service";

export class BookService {

  private static readonly LIBGEN_MIRROR = process.env.LIBGEN_MIRROR || 'http://libgen.vg';
  private static readonly BASE_DOWNLOAD_URL = 'https://download.books.ms';
  private static readonly FICTION_DOWNLOAD_URL = `${this.BASE_DOWNLOAD_URL}/fiction/`;
  private static readonly NON_FICTION_DOWNLOAD_URL = `${this.BASE_DOWNLOAD_URL}/main/`;
  private static readonly LIBGEN_COVERS = 'https://books.ms/';
  private static readonly SPLIT = '._-_.';
  private static readonly CACHE_DIR = '/tmp/app.bombi/cache/';
  private static readonly CONVERTED_PREFIX = 'CONVERTED_';


  // Google Spelling Correction
  private static readonly SEARCH_SUFFIX = ' book';
  private static readonly SEARCH_LANG_OPERATOR = 'lang:';
  private static readonly GOOGLE_CUSTOM_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';
  private static readonly GOOGLE_SEARCH_API_KEY = DEC('U2FsdGVkX1+OzilJcaZ0HHvEiXBKwMqai8HVF4YBD2ZT2vNmyao3/nGxc0FaZiz/HVERMeGf2eXoao0gYAj0Aw==');
  private static readonly GOOGLE_SEARCH_ENGINE_ID = DEC('U2FsdGVkX18Ojn/1fd2EQDZtxcO5EMndOFxadSUZkt7b9ogUBQ1glL0JsREgLY+9');

  static async download(book: Book, kindleMode = false): Promise<BookDownloadResponse> {
    if (!book.md5) {
      return await this.fetchFromLocal(book, kindleMode) || await this.fetchFromLocal(book, false);
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

    const downloadReponse = await this.fetchFromLocal(book, kindleMode)
      || await this.fetchFromLocal(book, false)
      || await this.downloadWithUrl(downloadUrl, coverUrl, `${book.md5}${this.SPLIT}${book.filename}`)
      || await this.downloadWithMD5(book.md5, coverUrl, `${book.md5}${this.SPLIT}${book.filename}`);

    if (downloadReponse) {
      downloadReponse.book.filePath = downloadReponse.book.filePath || await EpubToolsService.saveToDiskAsync(downloadReponse.book);
    }
    return downloadReponse;
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
        this.logAxiosError(error, "Trying to download book with url");
      }
  }

  static async downloadWithMD5(md5Hash: string, coverUrl: string, filename: string): Promise<BookDownloadResponse> {
    try {
      const page = (await axios.get<string>(`${this.LIBGEN_MIRROR}/ads.php?md5=${md5Hash}`)).data;
      const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?="><h2>GET<)/g);

      let downloadUrl = `${this.LIBGEN_MIRROR}/${page.match(regexDownloadURL).toString()}`;
      const request = await axios.get<Readable>(`${downloadUrl}`, { 
        responseType: 'stream'
      });

      let book = new BookBlob(request.data, filename);

      let cover = new CoverBlob();
      if (coverUrl) {
        try {
          const coverRequest = await axios.get<Readable>(coverUrl, { responseType: 'stream' });
          cover = new CoverBlob(coverRequest.data, coverRequest.config.url.split('/').pop());
        } catch (error) {
          this.logAxiosError(error, "Trying to download cover");
        }
      }
      
      return new BookDownloadResponse(book, cover);
    } catch(error) {
      this.logAxiosError(error, "Trying to download book with md5 hash");
    }
  }

  public static bookFileIsLocal(fileName: string, md5: string | undefined): boolean {
    let filePath = this.parseLocalFilePath(fileName, md5, false);
    if (existsSync(filePath)) {
      return true;
    }
    filePath = this.parseLocalFilePath(fileName, md5, true);
    return existsSync(filePath);
  }

  private static parseLocalFilePath(fileName: string, md5: string | undefined, kindleMode: boolean): string {
    let prefix = '';
    if (kindleMode) {
      prefix = this.CONVERTED_PREFIX;
    }
    if (md5) {
      prefix += md5 + this.SPLIT;
    } else if (kindleMode) {
      fileName = fileName.split('/').pop();
    }

    return `${this.CACHE_DIR}${prefix}${fileName}`;     
  }

  private static async fetchFromLocal(book: Book, kindleMode: boolean): Promise<BookDownloadResponse> {
    try {
      let filePath = this.parseLocalFilePath(book.filename, book.md5, kindleMode);      
      if(!existsSync(filePath)) return;

      let coverPath = '';
      if (!book.md5) {
        coverPath = `${dirname(require.main.filename)}/../static${book.coverUrl}`;
      } else {
        coverPath = `${this.CACHE_DIR}${book.coverUrl.split('/').pop()}`
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
    if (!book.filePath.startsWith(this.CACHE_DIR + this.CONVERTED_PREFIX)) {      
      await EpubToolsService.makeKindleCombatible(book);
    }
    const fileName = book.filename.replace(this.CONVERTED_PREFIX, '').split(this.SPLIT).pop();
    return await sendFileViaEmail(recipient, book.filePath, fileName);
  }

  static async sendFileToTolino(book: BookBlob, cover: CoverBlob, user: User) {
      book.filePath = book.filePath || await EpubToolsService.saveToDiskAsync(book);      

      if (cover.data && !cover.filePath) {
        cover.filePath =  await EpubToolsService.saveToDiskAsync(cover);
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

  public static async getSpellingCorrection(searchString: string) {
    const searchUrl = `${this.GOOGLE_CUSTOM_SEARCH_URL}?key=${this.GOOGLE_SEARCH_API_KEY}`
        + `&cx=${this.GOOGLE_SEARCH_ENGINE_ID}&num=1`;
    searchString = searchString.split(this.SEARCH_LANG_OPERATOR)[0];
    var response = await axios.get(`${searchUrl}&q=${searchString}${this.SEARCH_SUFFIX}`);
    if (response.data.spelling) {
        return response.data.spelling.correctedQuery.replace(this.SEARCH_SUFFIX, '');
    } else {
        return '';
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

  private static logAxiosError(error: AxiosError, message: string = '') {
    console.error(`[ERROR] ${message}\nAxios request failed for url ${error.config?.url} with cause: \n${error.cause}`);
  }
}