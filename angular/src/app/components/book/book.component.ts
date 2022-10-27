import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from 'src/app/models/book';
import { ImageDialogComponent } from '../dialogs/image-dialog/image-dialog.component';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent {

  constructor(private dialog: MatDialog) { }

  @Input()
  book: Book | undefined;

  enlarge() {
    if (this.book) {
      const url = this.book.cover_url == 'img/blank.png' ? '/assets/images/covers/blank.png' : 'https://libgen.li/' + this.book.cover_url.replace('_small', '');
      this.dialog.open(ImageDialogComponent, 
        {panelClass: 'image-dialog', 
        data: {url: url}});
    }
  }

}
