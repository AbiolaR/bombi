import axios from "axios";
import { LibgenDbService } from "../db/libgen-db.service";
import { SyncRequest } from "../../models/sync-request.model";
import { BookService } from "./book.service";
import { findAllUsersAsync, findUserAsync } from "../dbman";
import { BookSyncDbService } from "../db/book-sync-db.service";
import { SyncStatus } from "../../models/sync-status.model";
import { LibgenBook, LibgenBookColumn } from "../../models/db/mysql/libgen-book.model";
import { SyncLanguage } from "../../models/sync-language.model";
import { SyncBookProperty } from "../../models/db/mysql/sync-book.model";
import { User } from "../../models/db/mongodb/user.model";
import GoodreadsConnection from "../book-connection/goodreads-connection.service";
import TSGConnection from "../book-connection/tsg-connection.service";
import { ServerResponse } from "../../models/server-response";
import { SocialReadingPlatform } from "../../models/social-reading-platform";
import i18n from "../../i18n.config";
import { sendPushNotifications } from "../notification.service";
import { SyncRequestBookDownload } from "../../models/sync-request-book-download";
import { BookBlob } from "../../models/book-blob.model";
import { CoverBlob } from "../../models/cover-blob.model";

export class BookSyncService {
  private readonly LIBGEN_FICTION = 'https://library.lol/fiction/';
  private readonly LIBGEN_FICTION_COVERS = 'https://library.lol/fictioncovers/';
  private TEST_HASH: Promise<string>;
  private TEST_HASH_KEY = 'test_hash';
  private HOST_IP: Promise<string>;
  private HOST_IP_KEY = 'host_ip';

  constructor(private libgenDbService = new LibgenDbService(), private bookSyncDbService = new BookSyncDbService()) {
    this.TEST_HASH = libgenDbService.getParam(this.TEST_HASH_KEY);
    this.HOST_IP = libgenDbService.getParam(this.HOST_IP_KEY);
  }

  async updateUpcoming(): Promise<void> {
    let upcomingRequests = (await this.bookSyncDbService.findSyncRequests(undefined, [], SyncStatus.UPCOMING));
    let shouldBeWaitingRequests = upcomingRequests.filter(syncRequest => syncRequest.pubDate <= new Date());
    await this.bookSyncDbService.bulkUpdateSyncStatus(shouldBeWaitingRequests, SyncStatus.WAITING);
  }

  deleteSrpConnection(user: User, platform: SocialReadingPlatform): void {
    this.bookSyncDbService.deleteSyncRequests(user.username, platform);
    switch(platform) {
      case SocialReadingPlatform.GOODREADS:
          user.grPreferedLanguage = undefined;
          user.grRigidLanguage = undefined;
          user.grUseSyncTag = undefined;
          user.grUserId = undefined;
          user.grCookies = undefined;
          user.save()
          break;
      case SocialReadingPlatform.THE_STORY_GRAPH:
          user.tsgPreferedLanguage = undefined;
          user.tsgRigidLanguage = undefined;
          user.tsgUseSyncTag = undefined;
          user.tsgUsername = undefined;
          user.tsgCookies = undefined;
          user.save();
          break;
      default:
          console.error('Unsupported Social Reading Platform');
          break;
    }
  }

  async reSyncBooks(): Promise<void> {
    let hostIpUpdate = this.updateHostIp();
    let tsgConnection = new TSGConnection();
    let grConnection = new GoodreadsConnection();
    let users: User[] = await findAllUsersAsync();
    await hostIpUpdate;

    for(const user of users) {
      let grSync = new Promise<ServerResponse<SyncRequest[]>>((resolve) => resolve(new ServerResponse([])));
      let tsgSync = new Promise<ServerResponse<SyncRequest[]>>((resolve) => resolve(new ServerResponse([])));
      if (user.grUserId && user.grCookies) {
        grSync = grConnection.getBooksToReadByUsername(user.username);
      }
      if (user.tsgUsername && user.tsgCookies) {
        tsgSync = tsgConnection.getBooksToReadByUsername(user.username);
      }
      Promise.all([grSync, tsgSync]).then((results) => {
        let syncRequests = results[0].data.concat(results[1].data.filter((syncRequest) => results[0].data.indexOf(syncRequest) < 0));
        let creations: Promise<void>[] = [];
        for(const syncRequest of syncRequests) {
          syncRequest.status = SyncStatus.WAITING;
          creations.push(this.bookSyncDbService.createSyncRequest(syncRequest));
        }
        Promise.all(creations).then(() => {
          this.bookSyncDbService.findSyncRequests(user.username, [], SyncStatus.WAITING).then((syncRequests) => {
            this.syncBooks(syncRequests);
          });
        });
      });
    }
  }

  async syncBooks(syncRequests: SyncRequest[]): Promise<void> {
    await this.tryBasedOnProperty(syncRequests, 'isbn', 'Identifier');
    await this.tryBasedOnProperty(syncRequests, 'asin', 'ASIN');
    await this.tryBasedOnTitleAndAuthor(syncRequests);
    syncRequests.filter(this.noDownloadData).forEach(syncRequest => syncRequest.status = SyncStatus.UPCOMING);
    this.bookSyncDbService.updateDownloadData(syncRequests);
    this.downloadAll(syncRequests.filter(syncRequest => syncRequest.status == SyncStatus.WAITING));
  }

  private downloadAll(syncRequests: SyncRequest[]): void {
    let downloads: Promise<SyncRequestBookDownload>[] = [];
    for (const syncRequest of syncRequests) {
      if (syncRequest.downloadUrl) {
        downloads.push(this.attemptToDownloadBook(syncRequest));
      }
    }
    Promise.all(downloads).then(async (downloads: SyncRequestBookDownload[]) => {
      for (const download of downloads) {
        await this.attemptToSendBook(download.syncRequest, download.downloadResponse?.book, download.downloadResponse?.cover);
      }
    });
  }

  private async attemptToDownloadBook(syncRequest: SyncRequest): Promise<SyncRequestBookDownload> {
    const user: User = await findUserAsync(syncRequest.username);
    if (!user) {
      console.error('user does not exist when trying to send SyncRequest');
      return;
    }
    let coverUrl = user.eReaderType == 'T' ? `${this.LIBGEN_FICTION_COVERS}${syncRequest.coverUrl}` : '';
    let filename = `${syncRequest.title}.${syncRequest.downloadUrl.split('.').pop()}`;
    let response = await BookService.downloadWithUrl(
      `http://${await this.HOST_IP}/${syncRequest.downloadUrl}`, coverUrl, filename);
    if (!response) {
      response = await BookService.downloadWithMD5(syncRequest.md5Hash, coverUrl, filename);
    }
    return new SyncRequestBookDownload(syncRequest, response);
  }

  private async attemptToSendBook(syncRequest: SyncRequest, book: BookBlob, cover: CoverBlob): Promise<void> {
    if (book?.data) {
      const user: User = await findUserAsync(syncRequest.username);
      if (!user) {
        console.error('user does not exist when trying to send SyncRequest');
        return;
      }

      var result = { status: 500, message: {} };
      switch(user.eReaderType) {
        case 'K': // Kindle
          result = await BookService.sendFileToKindle(user.eReaderEmail, book);
          break;
        case 'T': // Tolino
          result = await BookService.sendFileToTolino(book, cover, user);
          break;
        default:
          result = { status: 501, message: `no eReader value set on user ${user.username}` };
          break;  
      }
      if (result.status != 200) {
        console.error(result.message);
        return;
      }

      if (syncRequest.pubDate > syncRequest.creationDate) {
        this.sendNotification((syncRequest));
      }
      this.bookSyncDbService.updateSyncStatus(syncRequest, SyncStatus.SENT);
    } else {
      syncRequest.downloadUrl = '';
      syncRequest.status = SyncStatus.UPCOMING;
      this.bookSyncDbService.updateDownloadData([syncRequest]);
      console.error('Error: failed to download syncRequest for: ', syncRequest.title);
    }
  }

  private async sendNotification(syncRequest: SyncRequest): Promise<void> {
    const user: User = await findUserAsync(syncRequest.username);
    let eReader: string;
    switch(user.eReaderType) {
      case 'K':
        eReader = 'Kindle';
        break;
      case 'T':
        eReader = 'Tolino';
    }
    let title = i18n.__({ phrase: 'book-available-title', locale: user.language });
    let message = i18n.__({ phrase: 'book-available-message', locale: user.language },
      { title: syncRequest.title, eReader: eReader });
    sendPushNotifications(user.pushSubscriptions, title, message)
  }
  
  private async updateHostIp(): Promise<void> {
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
      console.error('Error while trying to update host ip: ', error);
    }
  }

  private async tryBasedOnProperty(syncRequests: SyncRequest[], property: SyncBookProperty, column: LibgenBookColumn): Promise<void> {
    let values = syncRequests.filter(this.noDownloadData)
      .map((syncRequest) => syncRequest[property]).filter((prop) => !!prop?.trim());
    let libgenBooks = await this.libgenDbService.searchOneColumn(values, column);
    libgenBooks.forEach((libgenBook) => {
      syncRequests.filter((syncRequest) => {
        if(typeof libgenBook[column] === 'string') {
          return (libgenBook[column] as string).split(',').includes(syncRequest[property]);
        }
      }).forEach(syncRequest => this.setSyncBookDownloadData(syncRequest, libgenBook));
    });
  }

  private async tryBasedOnTitleAndAuthor(syncRequests: SyncRequest[]): Promise<void> {
    let searchValues = syncRequests.filter(this.noDownloadData)
      .map((syncRequest) => { 
        let author = syncRequest.author.includes(',') ? syncRequest.author.split(',').shift() 
          : syncRequest.author.split(' ').pop();
        return {title: syncRequest.title, author: author} 
      })
      .filter((searchObj) => !!searchObj.title?.trim() && !!searchObj.author?.trim());
    let libgenBooks = await this.libgenDbService.searchMultiColumn(searchValues, 'Title', 'Author');
    libgenBooks.forEach((libgenBook) => {
      syncRequests.filter((syncRequest) => {
        let author = syncRequest.author.includes(',') ? syncRequest.author.split(',').shift() 
          : syncRequest.author.split(' ').pop();
        return libgenBook.Title.toLowerCase().includes(syncRequest.title.toLowerCase()) 
          && libgenBook.Author.toLowerCase().includes(author.toLowerCase())
    }).forEach(syncRequest => this.setSyncBookDownloadData(syncRequest, libgenBook));
    });
  }

  private setSyncBookDownloadData(syncRequest: SyncRequest, libgenBook: LibgenBook): void {
    if ((syncRequest.language || SyncLanguage.ENGLISH) == libgenBook.Language) {
      syncRequest.md5Hash = libgenBook.MD5;
      syncRequest.coverUrl = libgenBook.Coverurl;
      syncRequest.downloadUrl = this.parseDownloadUrl(libgenBook);
    }
  }

  private parseDownloadUrl(libgenBook: LibgenBook): string {
    let series = '';
    if (libgenBook.Series) {
      series = `(${libgenBook.Series})`
    }
    return this.encodeUriAll(`/fiction/${this.torrentNumber(libgenBook)}/${libgenBook.MD5}.${libgenBook.Extension}/${series} ${libgenBook.Author} - ${libgenBook.Title}.${libgenBook.Extension}`);
  }

  private encodeUriAll(value: string): string {
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