import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent {

  constructor(private dialog: MatDialog, private deviceDetectorService: DeviceDetectorService,
    private userService: UserService, private translateService: TranslateService, private snackBar: MatSnackBar) { }

  @Input()
  book: Book | undefined;
  @Input()
  userData: UserData = new UserData();

  isImgLoaded = false;
  BOOK = DownloadMode.BOOK;
  

  enlarge() {
    if (!this.deviceDetectorService.isDesktop()) {
      return;
    }
    if (this.book) {
      const url = this.book.cover_url == 'img/blank.png' ? '/assets/images/covers/blank.png' : 'https://libgen.li/' + this.book.cover_url.replace('_small', '');
      this.dialog.open(ImageDialogComponent, 
        {panelClass: 'image-dialog', 
        data: {url: url}});
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

  private getEReader() {
    switch(this.userData.eReaderType) {
      case 'K': // Kindle
        return 'Kindle'
      case 'T': // Tolino
        return 'Tolino';
      default:
        return 'E-Reader';
    }
  }

}
