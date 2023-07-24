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
import { MatSelect } from '@angular/material/select';
import { SearchResult } from 'src/app/models/search-result';
import { LanguageMap } from 'src/app/models/language-map';

const ALT_GER_LANG = 'deu';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  @ViewChild(MatMenuTrigger) loginMenu: MatMenuTrigger | undefined;
  @ViewChild(MatSelect) authorSelect: MatSelect | undefined;
  books: Book[] | undefined;
  allBooks: Book[] | undefined;
  distinctAuthors: Set<string> = new Set();
  filteredAuthors: string[] = [];
  pageNumber = 1;
  isLastPage = false;
  searchString = '';
  selectedLang = '';
  suggestion = '';
  isLoading = false;
  showScrollToTop = false;
  oldScrollY = 0;
  usingCorrection = false;

  constructor(private route: ActivatedRoute, private searchService: BookService, private dialog: MatDialog, 
    public userService: UserService, private eventService: EventService, private router: Router) {

    eventService.menuEvent.subscribe(this.toggleLoginMenu.bind(this))

    route.queryParams.subscribe(async params => {
      this.books = undefined;
      this.distinctAuthors = new Set();
      this.usingCorrection = false;
      this.selectedLang = '';
      if (params['q']) {
        let advancedSearchString = this.searchString = params['q'];
        if (params['l'] && params['l'] != '') {
          this.selectedLang = params['l'];
          advancedSearchString += ` lang:${this.selectedLang}`
        }
        this.searchService.search(advancedSearchString, 1).subscribe({
          next: (result) => {
            if (result.books.length == 0 && result.suggestion) {
              advancedSearchString = this.suggestion = result.suggestion
              if (this.selectedLang) {
                advancedSearchString += ` lang:${this.selectedLang}`;
              }
              searchService.search(advancedSearchString , 1).subscribe({
                next: (result) => {
                  if (result.books.length != 0) {
                    this.usingCorrection = true;
                    this.setData(result);
                  }
                  this.searchForAdditionalGermanBooks();
                }
              });
            } else {
              this.setData(result);
              this.searchForAdditionalGermanBooks();
            }
            }
        });
      }
    });
  }

  searchForAdditionalGermanBooks() {
    if (this.selectedLang != LanguageMap.A) {
      return;
    }
    this.searchService.search(`${this.searchString} lang:${ALT_GER_LANG}`, 1).subscribe({
      next: (result) => {
        if (this.books) {
          this.books = this.books.concat(result.books);
        } else {
          this.setData(result);
        }
      }
    })
  }

  setData(result: SearchResult) {
    this.books = this.allBooks = result.books;
    this.distinctAuthors = new Set(result.books.map(book => book.author));
  }

  resetLangAndSearch() {
    this.searchString = this.searchString.replace(` lang:${this.selectedLang}`, '');
    this.selectedLang = '';
    this.search(this.searchString, '');
  }

  search(searchQuery: string, language: string) {
    this.router.navigate(['search'], { queryParams: { q: searchQuery, l: language } });
  }

  filterBooks() {
    this.books = this.allBooks;
    if (this.filteredAuthors.length > 0) {
      if ((this.filteredAuthors as (string | undefined)[]).includes(undefined)) {
        this.filteredAuthors = [];
        this.authorSelect?.close();
      } else {
        this.books = this.books?.filter(book => this.filteredAuthors.includes(book.author));
      }
    }
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
    const searchBar = document.getElementById('search-header');
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
        this.searchService.search(`${this.searchString} lang:${this.selectedLang}`, this.pageNumber).subscribe({
          next: (result) => {
            this.isLoading = false; 
            if (result.books.length == 0) {
              this.isLastPage = true;
            }  
            this.books = this.books?.concat(result.books);
            this.searchForAdditionalGermanBooks();
          }
        });
      }
    }
  }

}
