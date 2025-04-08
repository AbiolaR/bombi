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
import { LanguageMap } from 'src/app/models/language-map';
import { AppService } from 'src/app/services/app.service';
import { UserData } from 'src/app/models/user-data';
import { CommunicationService } from '../../../services/communication.service';
import { Location } from '@angular/common';
import { GroupedBook } from 'src/app/models/grouped-book.model';

const ALT_GER_LANG = 'Deutsch';
const AUTHOR = 'author';
const YEAR = 'year';
const LANG = 'language';
const BOOKS_PER_PAGE = 50;

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {  
  @ViewChild(MatSelect) authorSelect: MatSelect | undefined;
  @ViewChild(MatSelect) yearSelect: MatSelect | undefined;
  @ViewChild(MatSelect) langSelect: MatSelect | undefined;
  books: Book[] | undefined;
  allBooks: Book[] | undefined;
  distinctAuthors: Set<string> = new Set();
  filteredAuthors: string[] = [];
  authorMap: Map<string, Set<string>> = new Map();
  distinctYears: Set<number> = new Set();
  filteredYears: number[] = [];
  yearMap: Map<number, Set<number>> = new Map();
  distinctLanguages: Set<string> = new Set();
  filteredLanguages: string[] = [];
  languageMap: Map<string, Set<string>> = new Map();
  pageNumber = 1;
  isLastPage = false;
  searchString = '';
  selectedLang = '';
  suggestion = '';
  isLoading = false;
  showScrollToTop = false;
  oldScrollY = 0;
  usingCorrection = false;
  searchedUpcoming = false;
  currentEReader = 'E-Reader';
  userData: UserData = new UserData();
  performBarcodeScan = false;

  constructor(private route: ActivatedRoute, private searchService: BookService, 
    private dialog: MatDialog, public userService: UserService, private router: Router, 
    private appService: AppService, private communicationService: CommunicationService, 
    private location: Location) {
    this.userData = userService.getLocalUserData()
    this.currentEReader = this.getCurrentEReader();

    communicationService.eReaderTypeChanged().subscribe(() => {
      this.userData.eReaderType = userService.getLocalUserData().eReaderType;
      this.currentEReader = this.getCurrentEReader();
    });

    route.queryParams.subscribe(async params => {
      this.books = this.allBooks = undefined;
      this.searchedUpcoming = false;
      this.isLastPage = false;
      this.distinctAuthors = new Set();
      this.usingCorrection = false;
      this.selectedLang = '';
      if (params['q']) {
        this.isLoading = true;
        let advancedSearchString = this.searchString = params['q'];
        if (params['l'] && params['l'] != '') {
          this.selectedLang = params['l'];
          advancedSearchString += ` lang:${this.selectedLang}`
        }
        this.searchService.search(advancedSearchString, 1).subscribe({
          next: (result) => {
            this.isLoading = false;
            if (result.books.length == 0 && result.suggestion) {
              advancedSearchString = this.suggestion = result.suggestion
              if (this.selectedLang) {
                advancedSearchString += ` lang:${this.selectedLang}`;
              }
              searchService.search(advancedSearchString , 1).subscribe({
                next: (result) => {
                  if (result.books.length != 0) {
                    this.usingCorrection = true;
                    this.setData(result.books);
                  }
                  this.searchForAdditionalGermanBooks();
                }
              });

            } else if (result.books.length == 0 && !result.suggestion) {
              searchService.searchUpcoming(this.searchString, this.allBooks || []).subscribe({
                next: (result) => {
                  this.searchedUpcoming = true;
                  this.setData(result.books);
                  this.searchForAdditionalGermanBooks();
                }
              });
            } else {
              this.setData(result.books);
              this.searchForAdditionalGermanBooks();
            }
            }
        });
      } else if (params['scan'] == 'true') {
        this.location.go(this.location.path().split('?')[0]);
        this.performBarcodeScan = true;
      }

    });
  }

  scanBarcode() {
    this.communicationService.triggerBarcodeScan();
  }

  searchForAdditionalGermanBooks() {
    if (this.selectedLang != LanguageMap.A) {
      return;
    }
    this.searchService.search(`${this.searchString} lang:${ALT_GER_LANG}`, 1).subscribe({
      next: (result) => {
        if (this.allBooks) {
          this.setData(this.allBooks.concat(result.books));
        } else {
          this.setData(result.books);
        }
      }
    })
  }

  setData(books: Book[]) {
    books = books.map(book => Object.assign(new Book(), book));
    this.books = this.allBooks = books;
    this.fillFilterData();
    this.filterBooks();
  }

  private fillFilterData() {
    this.fillDistinctSet(AUTHOR, 0.75);
    this.fillDistinctSet(YEAR, 1);
    this.fillDistinctSet(LANG, 1);
  }

  resetLangAndSearch() {
    this.searchString = this.searchString.replace(` lang:${this.selectedLang}`, '');
    this.selectedLang = '';
    this.search(this.searchString, '');
  }

  search(searchQuery: string, language: string) {
    this.router.navigate(['search'], { queryParams: { q: searchQuery, l: language } });
  }

  minFilterSet(minAmount: number) : boolean {
    return this.reducedLength(this.filteredAuthors) + this.reducedLength(this.filteredYears) + this.reducedLength(this.filteredLanguages) >= minAmount;
  }

  private reducedLength(array: string[] | number[]) : number {
    return (array.length / array.length) || 0;
  }

  clearFilters() {
    this.filteredAuthors = [];
    this.filteredYears = [];
    this.filteredLanguages = [];
    this.books = this.allBooks//Array.from([this.allBooks![0],this.allBooks![1]]); //this.filterBooks();
  }

  openProfileDialog() {
    let dialogRef = this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      autoFocus: false,
      closeOnNavigation: false
    });
    dialogRef.afterClosed().subscribe(() => {
      this.userData = this.userService.getLocalUserData();
      this.appService.setLanguage(this.userData.language);
      this.currentEReader = this.getCurrentEReader();
    });
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
    if ((this.books?.length || 0) != 0 && !this.isLastPage) {
      this.loadAdditionalBooks();
    }
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
    if ((window.innerHeight + window.scrollY * 1.1) >= document.body.scrollHeight - window.innerHeight * 2) {
      if (!this.isLastPage && !this.isLoading) {
        this.pageNumber++;
        this.isLoading = true;
        let advancedSearchString = this.searchString;
        if (this.selectedLang) {
          advancedSearchString = `${advancedSearchString} lang:${this.selectedLang}`
        }
        this.searchService.search(advancedSearchString, this.pageNumber).subscribe({
          next: (result) => {
            this.isLoading = false; 
            if (result.books.length == 0) {
              this.isLastPage = true;
              if (!this.searchedUpcoming) {
                this.searchService.searchUpcoming(this.searchString, this.allBooks || []).subscribe({
                  next: (upcomingBooks) => {
                    this.setData(this.allBooks?.concat(upcomingBooks.books) || []);
                  }
                });
              }
            }  
            this.setData(this.allBooks?.concat(result.books) || []);
            this.searchForAdditionalGermanBooks();
          }
        });
      }
    }
  }

  similarity(s1: string, s2: string) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength.toString());
  }

  editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  private fillDistinctSet(property: string, similarity: number) {
    let distinctSet = new Set<string | number | Date | boolean | GroupedBook[] | undefined>;
    let map = new Map<string | number | Date | boolean | GroupedBook[] | undefined, Set<string | number | Date | boolean | GroupedBook[] | undefined>>;

    distinctSet = new Set(this.allBooks?.map(book => book[property as keyof typeof book]));
    distinctSet.forEach(prop => {
      if (prop == '' || prop == 0 || prop == undefined) {
        return;
      }
      var cleanProperty = prop.toString().replace(/[^a-z0-9]/gi, '').toLowerCase();
      distinctSet.forEach(comparedProperty => {
        if (!comparedProperty) return;
        var cleanComparedProperty = comparedProperty.toString().replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (Array.from(cleanProperty).sort().toString() == Array.from(cleanComparedProperty).sort().toString() 
        || this.similarity(Array.from(cleanProperty).sort().toString(), Array.from(cleanComparedProperty).sort().toString()) > similarity) {
          map.set(prop, map.get(cleanProperty)?.add(prop) || new Set<string | number | Date | boolean | GroupedBook[]>().add(comparedProperty));
          map.set(prop, map.get(cleanProperty)?.add(comparedProperty) || new Set<string | number | Date | boolean | GroupedBook[]>().add(comparedProperty));
          if (prop != comparedProperty) {
            distinctSet.delete(comparedProperty);        
          }
        }
      });
    });
    switch(property) {
      case AUTHOR:
        this.distinctAuthors = distinctSet as Set<string>;
        this.authorMap = map as Map<string, Set<string>>;
        break;
      case YEAR:
        this.distinctYears = distinctSet as Set<number>;
        this.yearMap = map as Map<number, Set<number>>;
        break;
      case LANG:
        this.distinctLanguages = distinctSet as Set<string>;
        this.languageMap = map as Map<string, Set<string>>;
    }
  }

  filterBooks() {
    this.books = this.allBooks;
    let filteredAuthors = this.getFilter(AUTHOR, this.filteredAuthors, this.authorMap, this.authorSelect);
    let filteredYears = this.getFilter(YEAR, this.filteredYears, this.yearMap, this.yearSelect);
    let filteredLanguages = this.getFilter(LANG, this.filteredLanguages, this.languageMap, this.langSelect);

    this.books = this.books?.filter(book => filteredAuthors.includes(book.author) && filteredYears.includes(book.year) && filteredLanguages.includes(book.language));
    if ((this.books?.length || 0) != 0 && (this.books?.length || 0) < BOOKS_PER_PAGE && !this.isLastPage) {
      this.loadAdditionalBooks();
    }
  }

  private getFilter(property: string, array: any[], map: Map<string | number, Set<string | number>>, select: MatSelect | undefined) : any[] {
    let filter = Array.from(array);

    filter.forEach(item => {
      if (map.has(item)) {
        map.get(item)?.forEach(item => {
          filter.push(item);
        })
      }
    });

    if (filter.length > 0) {
      if ((array as (string | undefined)[]).includes(undefined)) {
        select?.close();
        switch (property) {
          case AUTHOR:
            this.filteredAuthors = [];
            break;
          case YEAR:
            this.filteredYears = [];
            break;
          case LANG:
            this.filteredLanguages= [];
            break
        }
      }
    }

    return filter.length > 0 && !(array as (string | undefined)[]).includes(undefined)
      ? filter 
      : this.allBooks?.map(book => book[property as keyof typeof book]) || [];
  }

  getCurrentEReader() {
    switch(this.userData.eReaderType) {
      case 'K': // Kindle
        return 'Kindle'
      case 'T': // Tolino
        return 'Tolino';
      case 'P': // PocketBook
        return 'PocketBook';
      default:
        return 'E-Reader';
    }
  }

}
