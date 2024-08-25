import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-title',
  standalone: true,
  imports: [],
  templateUrl: './book-title.component.html',
  styleUrl: './book-title.component.scss'
})
export class BookTitleComponent {
  @Input()
  title: string = ''; 

  setAutoScroll(element: HTMLHeadingElement) {
    if (element.offsetWidth < element.scrollWidth) {
      element.classList.add('auto-scroll');
    }  else {
      element.classList.remove('auto-scroll');
    }
  }
}