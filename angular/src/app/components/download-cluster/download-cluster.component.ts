import { HttpStatusCode } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { Book } from 'src/app/models/book';
import { CustomBook } from 'src/app/models/custom-book';
import { DownloadMode } from 'src/app/models/download-mode';
import { ServerResponse } from 'src/app/models/server-response';
import { SocialReadingPlatform } from 'src/app/models/social-reading-platform';
import { SyncLanguage } from 'src/app/models/sync-language.model';
import { SyncRequest } from 'src/app/models/sync-request.model';
import { SyncStatus } from 'src/app/models/sync-status.model';
import { BookService } from 'src/app/services/book.service';
import { EventService } from 'src/app/services/event.service';
import { SocialReadingPlatformService } from 'src/app/services/social-reading-platform.service';
import { UserService } from 'src/app/services/user.service';
import { symbolName } from 'typescript';

@Component({
  selector: 'app-download-cluster',
  templateUrl: './download-cluster.component.html',
  styleUrls: ['./download-cluster.component.scss']
})
export class DownloadClusterComponent {

  constructor(private bookService: BookService, private userService: UserService,
    private eventService: EventService, private srpService: SocialReadingPlatformService) {}

  @Input({ required: true })
  book!: Book;

  @Input()
  customBook: CustomBook | undefined;

  @Input()
  mode: DownloadMode = DownloadMode.BOOK;

  @Input()
  currEReader: string = this.currentEReader();

  @Input()
  buttonClassList: String = '';

  stateDuration = 10000;

  public download(button: any) {
    button.classList.remove('success');
    button.classList.remove('failure');
    button.classList.add('loading');
    var filename = '';
    var downloadVar = '';
    switch(this.mode) {
      case DownloadMode.BOOK:
        if (!this.book) return;
        filename = this.book.filename;
        downloadVar = this.book.md5;
        break;
      case DownloadMode.URL:
        if (!this.customBook) return;
        filename = `${this.customBook.filename}.epub`;
        downloadVar = this.customBook.url;
        break;  
    }

    this.bookService.download(this.book).subscribe({
      next: (file) => {
        this.handleDownload(button, filename, file);
      },
      error: (error) =>  {
        this.showResult(button, 'failure');
        if (error.status == HttpStatusCode.Unauthorized) {
          this.eventService.openLoginMenu();
          console.warn('user is not authorized, please login again');
        } else {
          console.warn('error while sending book');
        }
      }
    });
    
  }

  private handleDownload(button: any, filename: string, file: any) {
    const anchor = window.document.createElement('a');
    anchor.href = window.URL.createObjectURL(file);
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(anchor.href);    
    button.classList.remove('loading');   
  }

  public sendToEReader(button: any) {   
    const userData = this.userService.getLocalUserData();
    if (!userData) {
      this.eventService.openLoginMenu();
      return;
    }
    button.classList.remove('success');
    button.classList.remove('failure');
    button.classList.add('loading');

    let action: Observable<ServerResponse<Boolean>>;

    if (this.book.id == 999999999) {
      let language = this.book.language == 'German' ? SyncLanguage.GERMAN : SyncLanguage.ENGLISH;

      let syncRequest = new SyncRequest(userData.username, this.book.isbn.toString(), this.book.title,
        this.book.author, new Date(this.book.year), SyncStatus.WAITING, SocialReadingPlatform.NONE,
        language, new Date());
      action = this.srpService.sendSyncRequests([syncRequest]);
    } else {
      action = this.bookService.sendToEReader(this.book);
    }

    action.subscribe({
      next: () => {
        this.showResult(button, 'success');
      },
      error: (error) =>  {
        this.showResult(button, 'failure');
        if (error.status == HttpStatusCode.Unauthorized) {
          this.eventService.openLoginMenu();
          console.warn('user is not authorized, please login again');
        } else {
          console.warn('error while sending book');
        }
      }
    });
  }

  private showResult(button: any, result: String) {
    button.classList.remove('loading');
    button.classList.add(result);
        /*setTimeout(() => {
          button.classList.remove(result);
        }, this.stateDuration);*/
  }

  currentEReader() {
    switch(this.userService.getLocalUserData()?.eReaderType) {
      case 'K': // Kindle
        return 'Kindle'
      case 'T': // Tolino
        return 'Tolino';
      case 'P': // PocketBook
        return 'PocketBook';
      default:
        return 'E-Reader';
    }
  }
}
