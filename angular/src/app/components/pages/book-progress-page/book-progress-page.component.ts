import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { ImageDialogComponent } from '../../dialogs/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-book-progress-page',
  templateUrl: './book-progress-page.component.html',
  styleUrl: './book-progress-page.component.scss'
})
export class BookProgressPageComponent implements OnInit {

  constructor(private bookService: BookService, private userService: UserService, private dialog: MatDialog,
    private deviceDetectorService: DeviceDetectorService,
  ) {}

  eReaderType: string = '';
  books: Book[] = []
  
  ngOnInit(): void {
    this.eReaderType = this.userService.getLocalUserData().eReaderType;
    this.bookService.getProgress(this.eReaderType).subscribe({
      next: (response) => {
        if (response.status == 0) {
          this.books = response.data;
        }
      }
    })
  }

  enlarge(book: Book) {
    this.dialog.open(ImageDialogComponent, 
      {
        panelClass: 'image-dialog', 
        data: {url: book.coverUrl}
      }
    );
  }

  roundedPercentageVal(percentage: number): number {
    return Math.round(percentage * 100);
  }

}
