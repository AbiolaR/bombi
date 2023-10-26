import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Book } from 'src/app/models/book';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input()
  message: Book | undefined;

  isImgLoaded = false;

  constructor(private router: Router) { }
  ngOnInit(): void {
    if (this.message) {
      this.message.message = this.message.message?.replaceAll('\n', '<br/>');
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
