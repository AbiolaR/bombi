import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';
import { UserService } from 'src/app/services/user.service';
import { ProfileDialogComponent } from '../../dialogs/profile-dialog/profile-dialog.component';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  books: Book[] = [];

  constructor(private route: ActivatedRoute, private searchService: BookService, private dialog: MatDialog, 
    public userService: UserService) {
    route.params.subscribe(async params => {
      this.books = [];
      if (params['q']) {
        searchService.search(params['q']).subscribe({
          next: (books) => {        
            this.books = books;
          }
        });

      }
    })
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      width: '500px'
    });
  }

  ngOnInit(): void {
  }

}
