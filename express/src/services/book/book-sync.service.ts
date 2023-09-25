import axios from "axios";
import { LibgenDbService } from "../db/libgen-db.service";
import { SyncRequest } from "../../models/sync-request.model";
import { BookService } from "./book.service";
import { findUserAsync } from "../dbman";
import { BookSyncDbService } from "../db/book-sync-db.service";
import { SyncStatus } from "../../models/sync-status.model";
import { LibgenBook } from "../../models/db/libgen-book.model";
import { SyncLanguage } from "../../models/sync-language.model";

export class BookSyncService {

    private readonly LIBGEN_FICTION = 'https://library.lol/fiction/';
    private TEST_HASH: Promise<string>;
    private TEST_HASH_KEY = 'test_hash';
    private HOST_IP: Promise<string>;
    private HOST_IP_KEY = 'host_ip';

    constructor(private libgenDbService: LibgenDbService, private bookSyncDbService: BookSyncDbService) {
      this.TEST_HASH = libgenDbService.getParam(this.TEST_HASH_KEY);
      this.HOST_IP = libgenDbService.getParam(this.HOST_IP_KEY);
    }

    async updateHostIp() {
        const regexDownloadURL = new RegExp(/(?<=href=")(.*)(?=">GET<)/g);
        const regexHostIp = new RegExp(/(?<=\/\/)(.*?)(?=\/)/g);

        var config = {
            method: 'get',
            url: `${this.LIBGEN_FICTION}${await this.TEST_HASH}`,
          };
        
          var result = await axios(config);
          const page = await result.data;

        var downloadURL = '';
        try {
          downloadURL = page.match(regexDownloadURL).toString();
          let hostIp = downloadURL.match(regexHostIp).toString();
          if(hostIp) {
            this.libgenDbService.updateHostIp(hostIp);
          }
        } catch(error) {
          console.log('Error while trying to update host ip: ', error);
        }
    }

  download(syncRequests: SyncRequest[]) {
    syncRequests.forEach(syncRequest => {
      if (syncRequest.downloadUrl) {
        console.log('before attempt to send');
        this.attemptToSendBook(syncRequest);
        console.log('after attempt to send');
      }
    });
  }

  async attemptToSendBook(syncRequest: SyncRequest) {
    let book = await BookService.downloadWithUrl(`http://${await this.HOST_IP}/${syncRequest.downloadUrl}`);
    if (book.file) {
      let filename = `${syncRequest.title}.${syncRequest.downloadUrl.split('.').pop()}`;
      const user = await findUserAsync(syncRequest.username);
      if (!user) {
        console.error('user does not exist when trying to send SyncRequest');
        return;
      }

      var result = { status: 500, message: {} };
      switch(user.eReaderType) {
        case 'K': // Kindle
          result = await BookService.prepareAndSendFileToKindle(user.eReaderEmail, book.file, filename);
          break;
        case 'T': // Tolino
          result = await BookService.sendFileToTolino(book, filename, user);
          break;
        default:
          result = { status: 501, message: `no eReader value set on user ${user.username}` };
          break;  
      }
      if (result.status != 200) {
        console.error(result.message);
        return;
      }

      this.bookSyncDbService.updateSyncStatus(syncRequest, SyncStatus.SENT);
      console.log('sent and updated');
    } else {
      console.log('Error: failed to download syncRequest for: ', syncRequest.title);
      //this.updateSyncBookData(syncRequest);
    }
    
  }

  async updateSyncBooksData(syncRequests: SyncRequest[]) {
    await this.tryBasedOnIsbn(syncRequests);
    console.log(syncRequests);
  }

  async tryBasedOnIsbn(syncRequests: SyncRequest[]) {
    let isbns = syncRequests.filter(this.noDownloadData)
    .map((syncRequest) => syncRequest.isbn).filter((isbn) => !!isbn?.trim());
    let libgenBooks = await this.libgenDbService.searchMulti(isbns, 'Identifier');
    libgenBooks.forEach((libgenBook) => {
      let i = syncRequests.findIndex((syncRequest) => libgenBook.Identifier.split(',').includes(syncRequest.isbn));
      this.setSyncBookDownloadData(syncRequests[i], libgenBook);
    });
  }

  setSyncBookDownloadData(syncRequest: SyncRequest, libgenBook: LibgenBook) {
    if (syncRequest.language || SyncLanguage.ENGLISH == libgenBook.Language) {
      syncRequest.md5Hash = libgenBook.MD5;
      syncRequest.coverUrl = libgenBook.Coverurl;
      syncRequest.downloadUrl = this.parseDownloadUrl(libgenBook);
    }
  }

  parseDownloadUrl(libgenBook: LibgenBook): string {
    let series = '';
    if (libgenBook.Series) {
      series = `(${libgenBook.Series})`
    }
    return this.encodeUriAll(`/fiction/${this.torrentNumber(libgenBook)}/${libgenBook.MD5}.${libgenBook.Extension}/${series} ${libgenBook.Author} - ${libgenBook.Title}.${libgenBook.Extension}`);
  }

  private encodeUriAll(value: string) {
    return value.replace(/[^A-Za-z0-9/.]/g, c =>
      `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    ).toLowerCase();
  }

  private torrentNumber(libgenBook: LibgenBook): number {
    return Math.floor(libgenBook.ID / 1000) * 1000;
  }

  private noDownloadData(syncRequest: SyncRequest): boolean {
    return !syncRequest.md5Hash?.trim() || !syncRequest.downloadUrl?.trim() || !syncRequest.coverUrl?.trim();
  } 

}