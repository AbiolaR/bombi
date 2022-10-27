import { HttpStatusCode } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { finalize } from 'rxjs';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-download-cluster',
  templateUrl: './download-cluster.component.html',
  styleUrls: ['./download-cluster.component.scss']
})
export class DownloadClusterComponent {

  constructor(private bookService: BookService, private userService: UserService, private eventService: EventService) {}

  @Input()
  book!: Book;

  stateDuration = 2000;

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

  public sendToEReader(button: any) {   
    const userData = this.userService.getUserData();
    if (!userData) {
      this.eventService.openLoginMenu();
      return;
    }
    button.classList.add('loading');
    this.bookService.sendToEReader(this.book.md5, this.book.filename).subscribe({
      next: () => {
        this.showResult(button, 'success');
      },
      error: (error) =>  {
        this.showResult(button, 'failure');
        if (error.status == HttpStatusCode.Unauthorized) {
          this.eventService.openLoginMenu();
          console.warn('user is not authorized, please login again');
        } else {
          console.warn('error while sending book');
        }
      }
    });
  }

  private showResult(button: any, result: String) {
    button.classList.remove('loading');
        button.classList.add(result);
        setTimeout(() => {
          button.classList.remove(result);
        }, this.stateDuration);
  }

  currentEReader() {
    switch(this.userService.getUserData()?.eReaderType) {
      case 'K': // Kindle
        return 'Kindle'
      case 'T': // Tolino
        return 'Tolino';
      default:
        return 'E-Reader';
    }
  }
}
