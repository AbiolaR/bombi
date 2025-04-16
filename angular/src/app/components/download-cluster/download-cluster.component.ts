import { HttpStatusCode } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { finalize, firstValueFrom, Observable } from 'rxjs';
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
import { ProfileDialogComponent } from '../dialogs/profile-dialog/profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-download-cluster',
  templateUrl: './download-cluster.component.html',
  styleUrls: ['./download-cluster.component.scss']
})
export class DownloadClusterComponent {

  constructor(private bookService: BookService, private userService: UserService,
    private eventService: EventService, private srpService: SocialReadingPlatformService,
    private dialog: MatDialog, private snackBar: MatSnackBar, private translateService: TranslateService) {}

  @ViewChild('downloadBtn') downloadButton: MatButton | undefined;
  @ViewChild('sendToEReaderBtn') sendToEReaderButton: MatButton | undefined;

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

  isDownloading = false;
  isSending = false;

  public download() {
    this.downloadButton?._elementRef.nativeElement.classList.remove('success');
    this.downloadButton?._elementRef.nativeElement.classList.remove('failure');
    this.downloadButton?._elementRef.nativeElement.classList.add('loading');
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

    this.isDownloading = true;
    this.bookService.download(this.book).pipe(
      finalize(() => {
        console.log('download complete');
        this.isDownloading = false;
      })
    ).subscribe({
      next: (file) => {
        this.handleDownload(this.downloadButton?._elementRef.nativeElement, filename, file);
      },
      error: (error) =>  {
        this.showResult(this.downloadButton?._elementRef.nativeElement, 'failure');
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
    anchor.download = filename.split('/').pop() || 'book.epub';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(anchor.href);    
    button.classList.remove('loading');   
  }

  public async sendToEReader() {   
    const userData = this.userService.getLocalUserData();
    if (!userData || !userData.username) {
      let snackRef = this.snackBar.open(
        await firstValueFrom(this.translateService.get('please-login-to-send-books-to-your-e-reader')), 
        await firstValueFrom(this.translateService.get('login')), {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      snackRef.onAction().subscribe(() => {
        this.eventService.openLoginMenu();
      });
      return;
    }
    if (!this.isEReaderSetup()) {
      this.openProfileDialog();
      return;
    }
    this.sendToEReaderButton?._elementRef.nativeElement.classList.remove('success');
    this.sendToEReaderButton?._elementRef.nativeElement.classList.remove('failure');
    this.sendToEReaderButton?._elementRef.nativeElement.classList.add('loading');

    let action: Observable<ServerResponse<Boolean>>;

    if (this.book.id == 999999999) {
      let language = this.book.language == 'German' ? SyncLanguage.GERMAN : SyncLanguage.ENGLISH;

      let syncRequest = new SyncRequest(userData.username, this.book.isbn[0], this.book.title,
        this.book.author, this.book.pubDate || new Date(), SyncStatus.WAITING, SocialReadingPlatform.NONE,
        language, new Date());
      action = this.srpService.sendSyncRequests([syncRequest]);
    } else {
      action = this.bookService.sendToEReader(this.book);
    }

    this.isSending = true;
    action.pipe(
      finalize(() => {
        this.isSending = false;
      })
    ).subscribe({
      next: () => {
        this.showResult(this.sendToEReaderButton?._elementRef.nativeElement, 'success');
      },
      error: (error) =>  {
        this.userService.updateUserData().subscribe();
        this.showResult(this.sendToEReaderButton?._elementRef.nativeElement, 'failure');
        if (error.status == HttpStatusCode.Unauthorized) {
          this.eventService.openLoginMenu();
          console.warn('user is not authorized, please login again');
        } else {
          console.warn('error while sending book');
        }
      }
    });
  }

  isEReaderSetup(): boolean {
    const userData = this.userService.getLocalUserData();
    switch(userData.eReaderType) {
      case 'K': // Kindle
        return !!userData.eReaderEmail;
      case 'T': // Tolino
        return !!userData.eReaderDeviceId && !!userData.eReaderRefreshToken;
      case 'P': // PocketBook
        return !!userData.pocketBookConfig?.cloudConfig || !!userData.pocketBookConfig?.sendToEmail;
      default:
        return false;
    }
  }

  private openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      autoFocus: false,
      data: true,
      closeOnNavigation: false
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
