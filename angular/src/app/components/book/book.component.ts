import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from 'src/app/models/book';
import { DownloadMode } from 'src/app/models/download-mode';
import { ImageDialogComponent } from '../dialogs/image-dialog/image-dialog.component';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent {

  constructor(private dialog: MatDialog, private deviceDetectorService: DeviceDetectorService) { }

  @Input()
  book: Book | undefined;

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

  ngOnChanges() {
    if (!this.deviceDetectorService.isDesktop()) {
      if (this.book) {
        this.book.cover_url = this.book.cover_url == 'img/blank.png' ? '/assets/images/covers/blank.png' : this.book.cover_url.replace('_small', '');
      }
    }
  }

}
