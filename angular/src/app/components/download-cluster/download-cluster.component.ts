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
  book: Book | undefined;

  public download() {
    if (!this.book){
      return
    }

    const filename = `${this.book.title.replace(' ', '_')}.${this.book.extension}`;

    this.bookService.download(this.book.md5, `temp_file.${this.book.extension}`).subscribe({
      next: (file) => {
        const anchor = window.document.createElement('a');
        anchor.href = window.URL.createObjectURL(file);
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(anchor.href);        
      }
    })
  }

  public sendToKindle() {
    if (!this.book){
      return
    }

    const filename = `${this.book.title.replace(' ', '_')}.${this.book.extension}`;

    this.bookService.sendToKindle(this.book.md5, `temp_file.${this.book.extension}`).subscribe({});
  }
}
