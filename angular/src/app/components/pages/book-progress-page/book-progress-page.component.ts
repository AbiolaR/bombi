import { Component, OnInit } from '@angular/core';
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

  constructor(private bookService: BookService, private userService: UserService, private dialog: MatDialog
  ) {}

  books: Book[] = []
  progressFetched = false;
  
  ngOnInit(): void {
    this.getBookProgress();
  }

  getBookProgress() {
    this.books = [];
    this.bookService.getProgress().subscribe({
      next: (response) => {        
        this.progressFetched = true;
        if (response.status == 0) {
          this.books = response.data.sort(this.sortByDateDesc);
        }
      }
    });
  }

  enlarge(book: Book) {
    this.dialog.open(ImageDialogComponent, 
      {
        panelClass: 'image-dialog', 
        data: {url: book.coverUrl}
      }
    );
  }

  sortByDateDesc(a: Book, b: Book): -1 | 0 | 1 {
    if (!a.pubDate || !b.pubDate) return 0;

    if (Date.parse(a.pubDate.toString()) < Date.parse(b.pubDate.toString())) {
      return 1;
    } else if (Date.parse(a.pubDate.toString()) > Date.parse(b.pubDate.toString())) {
      return -1;
    }

    return 0;
  }

}
