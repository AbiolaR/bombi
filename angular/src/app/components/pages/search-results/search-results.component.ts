import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';
import { EventService as EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
import { CustomUrlDialogComponent } from '../../dialogs/custom-url-dialog/custom-url-dialog.component';
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
  selectedLang = '';
  isLoading = false;
  showScrollToTop = false;
  oldScrollY = 0;

  constructor(private route: ActivatedRoute, private searchService: BookService, private dialog: MatDialog, 
    public userService: UserService, private eventService: EventService, private router: Router) {

    eventService.menuEvent.subscribe(this.toggleLoginMenu.bind(this))

    route.queryParams.subscribe(async params => {
      this.books = undefined;
      if (params['q']) {
        this.searchString = params['q'];
        if (params['l'] && params['l'] != '') {
          this.selectedLang = params['l'];
          this.searchString += ` lang:${this.selectedLang}`
        }
        this.searchService.search(this.searchString, 1).subscribe({
          next: (books) => {        
            this.books = books;
          }
        });
      }
    });
  }

  resetLangAndSearch() {
    this.searchString = this.searchString.replace(` lang:${this.selectedLang}`, '');
    this.selectedLang = '';
    this.router.navigate(['search'], { queryParams: { q: this.searchString } });
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

  scrollToTop() {
    window.scroll({top: 0, left: 0, behavior: 'smooth'});
  }

  openCustomUrlDialog() {
    this.dialog.open(CustomUrlDialogComponent, {
      width: '500px',
      data: { filename: this.searchString }
    })
  }

  searchGoogle() {
    window.open(`https://google.com/search?q=${this.searchString} epub download free`)
  }

  @HostListener("window:scroll", [])
  onScroll(): void {
    this.handleScrollToTopButtonScrollBehavior();
    this.handleSearchBarScrollBehavior();
    this.loadAdditionalBooks();    
  }  

  handleScrollToTopButtonScrollBehavior() {
    if (window.scrollY > 0) {
      this.showScrollToTop = true;
    } else {
      this.showScrollToTop = false;  
    }
  }

  handleSearchBarScrollBehavior() {
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    if (window.scrollY < this.oldScrollY && (this.oldScrollY - window.scrollY) >= 3) {
      searchBar?.classList.add('hover-search-bar');
      searchBar?.classList.remove('slide-up');
      searchBar?.classList.add('slide-down');
      searchResults?.classList.add('search-results');
    } else if (window.scrollY > this.oldScrollY){
      searchResults?.classList.remove('search-results');
      searchBar?.classList.remove('slide-down');
      searchBar?.classList.add('slide-up');
      searchBar?.classList.remove('hover-search-bar');
    }
    this.oldScrollY = window.scrollY;

    if (window.scrollY == 0) {
      searchBar?.classList.remove('hover-search-bar');
      searchResults?.classList.remove('search-results');
    }
  }

  loadAdditionalBooks() {
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
