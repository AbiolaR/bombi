import { Component, Input } from '@angular/core';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-download-cluster',
  templateUrl: './download-cluster.component.html',
  styleUrls: ['./download-cluster.component.scss']
})
export class DownloadClusterComponent {

  constructor(private bookService: BookService) {}

  @Input()
  book!: Book;

  public download(button: any) {
    button.classList.add('loading');
    this.bookService.download(this.book.md5).subscribe({
      next: (file) => {
        const anchor = window.document.createElement('a');
        anchor.href = window.URL.createObjectURL(file);
        anchor.download = this.book.filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(anchor.href);    
        button.classList.remove('loading');    
      }
    })
  }

  public sendToKindle(button: any) {
    button.classList.add('loading');
    this.bookService.sendToKindle(this.book.md5, this.book.filename).subscribe(() => {
      button.classList.remove('loading');
    });
  }
}
