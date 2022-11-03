import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';
import { EventService as EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
import { ProfileDialogComponent } from '../../dialogs/profile-dialog/profile-dialog.component';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  @ViewChild(MatMenuTrigger) loginMenu: MatMenuTrigger | undefined;
  books: Book[] | undefined;
  pageNumber = 1;
  isLastPage = false;
  searchString = '';
  isLoading = false;

  constructor(private route: ActivatedRoute, private searchService: BookService, private dialog: MatDialog, 
    public userService: UserService, private eventService: EventService) {

    eventService.menuEvent.subscribe(this.toggleLoginMenu.bind(this))

    route.params.subscribe(async params => {
      this.books = undefined;
      if (params['q']) {
        this.searchString = params['q'];
        searchService.search(this.searchString, this.pageNumber).subscribe({
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

  toggleLoginMenu(state: boolean) {
    if (state) {
      this.loginMenu?.openMenu();
    } else {
      this.loginMenu?.closeMenu();
    }
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY * 1.1) >= document.body.scrollHeight) {
      if (!this.isLastPage && !this.isLoading) {
        this.pageNumber++;
        this.isLoading = true;
        this.searchService.search(this.searchString, this.pageNumber).subscribe({
          next: (books: any) => {
            this.isLoading = false; 
            if (books.length == 0) {
              this.isLastPage = true;
            }  
            this.books = this.books?.concat(books);
          }
        });
      }
    }
  }

}
