import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  books: Book[] = [];

  constructor(private route: ActivatedRoute, private searchService: BookService) {
    route.params.subscribe(async params => {
      if (params['q']) {
        searchService.search(params['q']).subscribe({
          next: (books) => {
            this.books = books;
          }
        });

      }
    })
  }

  private validFormat(format: string) {
    return (format == 'epub' || format == 'mobi');
  }

  ngOnInit(): void {
  }

}
