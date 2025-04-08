import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from 'src/app/models/book';
import { DownloadMode } from 'src/app/models/download-mode';
import { ImageDialogComponent } from '../dialogs/image-dialog/image-dialog.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UserService } from 'src/app/services/user.service';
import { ServerResponse } from 'src/app/models/server-response';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserData } from 'src/app/models/user-data';
import { NotificationInfo } from 'src/app/models/notification-info';
import { Action } from 'src/app/models/action';
import { firstValueFrom } from 'rxjs';
import { AddMessageDialogComponent } from '../dialogs/add-message-dialog/add-message-dialog.component';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  constructor(private dialog: MatDialog, private deviceDetectorService: DeviceDetectorService,
    private userService: UserService, private translateService: TranslateService,
    private snackBar: MatSnackBar, public sanitizer: DomSanitizer, private router: Router) { }

  @Input()
  book: Book | undefined;
  @Input()
  userData: UserData = new UserData();
  environment = environment;

  @Input({ required: true })
  currentEReader!: string;

  isImgLoaded = false;
  BOOK = DownloadMode.BOOK;

  coverUrl = '';
  localBookAvailable = false;
  
  ngOnInit(): void {
    
    if (!this.book?.coverUrl || !this.book?.coverUrl.replace(/\/.*covers\//, '')) {
      this.coverUrl = '/assets/images/covers/blank.png';
    } else if (this.book.coverUrl.startsWith('https://books.google.com/')
      || this.book.coverUrl.startsWith('http://books.google.com/')
      || this.book.coverUrl.startsWith('/assets/')
      || this.book.coverUrl.startsWith('blob:')) {
      this.coverUrl = this.book.coverUrl;
    } else {
      this.coverUrl = environment.apiServerUrl + '/v1/books/coversproxy' + this.book.coverUrl
    }
    this.localBookAvailable = this.book?.local || this.book?.groupedBooks.some((book) => book.local) || false;
    //this.coverUrl = this.coverUrl.replace('//', '').replace('http:/', 'http://').replace('https:/', 'https://');
  }

  enlarge() {
    if (!this.isImgLoaded) {
      return;
    }
    if (this.book) {
      this.dialog.open(ImageDialogComponent, 
        {panelClass: 'image-dialog', 
        data: {url: this.coverUrl}});
    }
  }

  setAutoScroll(element: HTMLHeadingElement) {
    if (element.offsetWidth < element.scrollWidth) {
      element.classList.add('auto-scroll');
    }  else {
      element.classList.remove('auto-scroll');
    }
  }

   async shareBook(contact: string) {
    if (!this.book) {
      return;
    }
    
    const author = this.book.author ? `${this.book.author}: ` : '';
    let eReader = this.getEReader();
    const actions = [Action.Download(await firstValueFrom(this.translateService.get('download'))), // TODO
    Action.SendToEReader(await firstValueFrom(this.translateService.get('send-to-currentereader', 
    { arg: eReader })))];

    const notificationInfo = new NotificationInfo(
      `${this.userData.username} ${await firstValueFrom(this.translateService.get('has-shared-a-book'))}`, 
      `${author}${this.book.title}`, 
      
    );

    this.userService.shareBook(contact, this.book, notificationInfo).subscribe({
      next: (response: ServerResponse<boolean>) => {
        switch(response.status) {
          case 0:
            this.translateService.stream('shared-book-with', { arg: contact }).subscribe((translation) => {
              this.snackBar.open(translation, '', { duration: 4000});
            });
            break;
          case 2:
            console.warn('username does not exist');
            break;
        }
      }
    });
  }

  public openAddMessageDialog(contact: string) {
    const dialogRef = this.dialog.open(AddMessageDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(message => {
      if (message && this.book) {
        this.book.message = message;
        this.shareBook(contact);
      }
    });
  }

  public searchAuthor() {
    if (this.book?.author) {
      this.router.navigate(['search'], { queryParams: { q: this.book.author, l: this.book.language } });
    }
  }

  private getEReader() {
    switch(this.userData.eReaderType) {
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
