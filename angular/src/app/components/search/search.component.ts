import { KeyValue } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { LanguageMap } from 'src/app/models/language-map';
import { UserData } from 'src/app/models/user-data';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  @Input()
  searchString = '';

  languages = LanguageMap;

  @Input()
  selectedLang = '';

  userData: UserData = new UserData();
  hasText: boolean = this.searchString.length > 0;

  @ViewChild(MatMenuTrigger) langMenuTrigger: MatMenuTrigger | undefined;
  @ViewChild(MatAutocompleteTrigger) searchHistoryDD: MatAutocompleteTrigger | undefined;
  @ViewChild(MatInput) searchInput: MatInput | undefined;

  constructor(private router: Router, private userService: UserService) { }

  minimumLength: number = 4;
  searchForm = new FormGroup({ 
                    input: new FormControl(this.searchString, 
                      { validators: [Validators.minLength(this.minimumLength), this.noEmptyStringValidator], 
                        updateOn: 'submit'})});


  ngOnInit() {
    this.fetchData();
  }

  ngOnChanges() {
    this.searchString = this.searchString.replace(` lang:${this.selectedLang}`, '');
    this.searchForm.get('input')?.setValue(this.searchString);
    (this.searchInput as any)?._elementRef.nativeElement.blur();
  }

  public onSubmit() {
    if (this.searchForm.valid) {
      this.saveToSearchHistory();
      (this.searchInput as any)._elementRef.nativeElement.blur();
      this.router.navigate(['search'], { queryParams: { q: this.searchForm.get('input')?.value, l: this.selectedLang } });
    }
  }

  public submitForm() {
    this.searchForm.get('input')?.setValue(this.searchInput?.value || '');
    this.onSubmit();
  }

  public clearSearch() {
    this.searchString = '';
    this.searchInput!.value = '';
  }

  public searchHasText() : boolean {
    return (this.searchInput?.value.length || 0) > 0; 
  }

  private saveToSearchHistory() {
    if (this.userData.getNewestSearchHistoryEntry() == this.searchForm.get('input')?.value) {
      return;
    }
    
    this.userData.searchHistory.set(Date.now().toString(), this.searchForm.get('input')?.value || '');
    this.userData.deleteOldSearchHistoryEntries();
    this.saveSearchHistory();
    this.searchHistoryDD?.closePanel();
  }

  deleteSearchHistoryEntry(key: string, event: any) {
    this.userData.searchHistory.delete(key);
    this.saveSearchHistory();
    event.stopPropagation();
  }

  private saveSearchHistory() {
    if (this.userService.isLoggedIn()) {
      this.userService.saveSearchHistory(this.userData.searchHistory).subscribe({});
    } else {
      this.userService.saveLocalSearchHistory(this.userData.searchHistory);
    }
  }
  
  fetchData() {
    if (!this.userService.isLoggedIn()) {
      this.userData = this.userService.getLocalUserData() || new UserData();
    } else {
      this.userService.getUserData().subscribe({
        next: (response) => {
          this.userData = response;
          this.userData.searchHistory = new Map(Object.entries(this.userData.searchHistory || new Map()));
          this.userData = Object.assign(new UserData, this.userData);
        }
      });
    }
  }

  openMenu(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.langMenuTrigger?.openMenu();
  }

  public noEmptyStringValidator(control: AbstractControl) : ValidationErrors | null  {
    return (control.value || '').trim().length? null : { emptyString: true };
  }

  keyDescOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return +a.key > +b.key ? -1 : (+b.key > +a.key ? 1 : 0);
  }
}
