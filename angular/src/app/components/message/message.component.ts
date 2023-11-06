import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Book } from 'src/app/models/book';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input()
  message: Book | undefined;

  isImgLoaded = false;

  coverUrl = '';
  isOpened = false;

  constructor(private router: Router) { }
  ngOnInit(): void {
    if (this.message) {
      this.message.message = this.message.message?.replaceAll('\n', '<br/>');

      if (!this.message.coverUrl || this.message.coverUrl.includes('blank.png')) {
        this.coverUrl = '/assets/images/covers/blank.png';
      } else if (this.message.coverUrl.startsWith('https://books.google.com/')
        || this.message.coverUrl.startsWith('http://books.google.com/')) {
        this.coverUrl = this.message.coverUrl;
      } else if (this.message.coverUrl.includes('/fictioncovers/')) {
        this.coverUrl = 'https://libgen.li' + this.message.coverUrl;
      } else {
        this.coverUrl = environment.apiServerUrl + '/v1/books/fictioncovers/' + this.message.coverUrl
      }
    }
  }
  
  toggleShrink(element: HTMLSpanElement) {
    if (element.scrollHeight - element.offsetHeight > 1) {
      element.classList.add('shrink');
    }  else {
      element.classList.remove('shrink');
    }
  }

  searchMore() {
    this.router.navigate(['search'], { queryParams: { q: this.message?.title, } });
  }

}
