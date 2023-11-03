import { HttpStatusCode } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { finalize } from 'rxjs';
import { Book } from 'src/app/models/book';
import { CustomBook } from 'src/app/models/custom-book';
import { DownloadMode } from 'src/app/models/download-mode';
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

  @Input({ required: true })
  book!: Book;

  @Input()
  customBook: CustomBook | undefined;

  @Input()
  mode: DownloadMode = DownloadMode.BOOK; 

  @Input()
  buttonClassList: String = '';

  stateDuration = 10000;

  public download(button: any) {
    button.classList.remove('success');
    button.classList.remove('failure');
    button.classList.add('loading');
    var filename = '';
    var downloadVar = '';
    switch(this.mode) {
      case DownloadMode.BOOK:
        if (!this.book) return;
        filename = this.book.filename;
        downloadVar = this.book.md5;
        break;
      case DownloadMode.URL:
        if (!this.customBook) return;
        filename = `${this.customBook.filename}.epub`;
        downloadVar = this.customBook.url;
        break;  
    }

    this.bookService.download(this.book).subscribe({
      next: (file) => {
        this.handleDownload(button, filename, file);
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

  private handleDownload(button: any, filename: string, file: any) {
    const anchor = window.document.createElement('a');
    anchor.href = window.URL.createObjectURL(file);
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(anchor.href);    
    button.classList.remove('loading');   
  }

  public sendToEReader(button: any) {   
    const userData = this.userService.getLocalUserData();
    if (!userData) {
      this.eventService.openLoginMenu();
      return;
    }
    button.classList.remove('success');
    button.classList.remove('failure');
    button.classList.add('loading');
    this.bookService.sendToEReader(this.book).subscribe({
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
        /*setTimeout(() => {
          button.classList.remove(result);
        }, this.stateDuration);*/
  }

  currentEReader() {
    switch(this.userService.getLocalUserData()?.eReaderType) {
      case 'K': // Kindle
        return 'Kindle'
      case 'T': // Tolino
        return 'Tolino';
      default:
        return 'E-Reader';
    }
  }
}
