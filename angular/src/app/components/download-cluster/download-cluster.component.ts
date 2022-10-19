import { HttpStatusCode } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { finalize } from 'rxjs';
import { Book } from 'src/app/models/book';
import { UserData } from 'src/app/models/user-data';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-download-cluster',
  templateUrl: './download-cluster.component.html',
  styleUrls: ['./download-cluster.component.scss']
})
export class DownloadClusterComponent {

  constructor(private bookService: BookService, private userService: UserService) {}

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

    const userData = this.userService.getUserData();
    if (!userData) {
      console.warn('please login first');
      return;
    }
    if (!userData.eReaderEmail) {
      console.warn('please set kindle email first');
    }
    button.classList.add('loading');
    this.bookService.sendToKindle(userData.eReaderEmail, this.book.md5, this.book.filename)
    .pipe(finalize(() => button.classList.remove('loading')))
    .subscribe({
      error: (error) =>  {
        if (error.status == HttpStatusCode.Unauthorized) {
          console.warn('user is not authorized, please login again');
        } else {
          console.warn('error while sending book');
        }
      }
    });
  }
}
