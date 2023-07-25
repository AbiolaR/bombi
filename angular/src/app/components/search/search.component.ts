import { KeyValue } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
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

  @ViewChild(MatMenuTrigger) langMenuTrigger: MatMenuTrigger | undefined;
  @ViewChild(MatAutocompleteTrigger) searchHistoryDD: MatAutocompleteTrigger | undefined;

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
  }

  public onSubmit(form: FormGroup) {
    if (form.valid) {
      this.saveToSearchHistory(form);
      this.router.navigate(['search'], { queryParams: { q: form.get('input')?.value, l: this.selectedLang } });
    }
  }

  private saveToSearchHistory(form: FormGroup) {
    if (this.userData.getNewestSearchHistoryEntry() == form.get('input')?.value) {
      return;
    }
    this.userData.searchHistory.set(Date.now().toString(), form.get('input')?.value);
    /*if (this.userData.searchHistory.size > 5) {
      this.userData.searchHistory.delete(this.getOldestEntry(this.userData.searchHistory));
    }*/

    this.userData.deleteOldSearchHistoryEntries();

    if (this.userService.isLoggedIn()) {
      this.userService.saveSearchHistory(this.userData.searchHistory).subscribe({});
    } else {
      this.userService.saveLocalSearchHistory(this.userData.searchHistory);
    }

    this.searchHistoryDD?.closePanel();
  }
  
  fetchData() {
    if (!this.userService.isLoggedIn()) {
      this.userData = this.userService.getLocalUserData() || new UserData();
    } else {
      this.userService.getUserData().subscribe({
        next: (response) => {
          this.userData = response;
          this.userData.searchHistory = new Map(Object.entries(this.userData.searchHistory));
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
