import { Component, Input, OnInit } from '@angular/core';
import { UserRelatedData } from 'src/app/models/user-related-data';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-ereader-config',
  templateUrl: './ereader-config.component.html',
  styleUrls: ['./ereader-config.component.scss']
})
export class EReaderConfigComponent implements OnInit {

  @Input()
  userRelatedData: UserRelatedData = new UserRelatedData();

  activeEReader: number = 0;
  stateDuration = 1500;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    switch (this.userRelatedData.eReaderType) {
      case 'K': // Kindle
        this.activeEReader = 0;
        break;
      case 'T': // Tolino
        this.activeEReader = 1;
        break;
      default:
        this.userRelatedData.eReaderType = 'K';
        break;
    }
  }

  setEReader(index: any): void {
    switch(index) {
      case 0: // Kindle
        this.userRelatedData.eReaderType = 'K';
        break;
      case 1: // Tolino
        this.userRelatedData.eReaderType = 'T';
        break;
    }
  }

  testAuth(button: any) {
    button.classList.add('loading');
    this.bookService.testTolinoAuth(this.buildJsonObject()).subscribe({
      next: (data) => {
        this.showResult(button, 'success');
        if (!this.userRelatedData.eReaderRefreshToken.startsWith('*****')) {
          this.userRelatedData.eReaderRefreshToken = data.refresh_token;
        }
      },
      error: (msg) => {
        this.showResult(button, 'failure');
        console.warn('errrr', msg);
      }
    })
  }

  private showResult(button: any, result: String) {
    button.classList.remove('loading');
        button.classList.add(result);
        setTimeout(() => {
          button.classList.remove(result);
        }, this.stateDuration);
  }

  private buildJsonObject(): Object {
    if (this.userRelatedData.eReaderDeviceId.startsWith('*****')
    && this.userRelatedData.eReaderRefreshToken.startsWith('*****')) {

      return { username: this.userRelatedData.username };  
    }
    return { eReaderDeviceId: this.userRelatedData.eReaderDeviceId, 
      eReaderRefreshToken: this.userRelatedData.eReaderRefreshToken }
  }

}
