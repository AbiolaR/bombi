import { Component, Input, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { LanguageMap } from 'src/app/models/language-map';

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

  @ViewChild(MatMenuTrigger) langMenuTrigger: MatMenuTrigger | undefined;

  constructor(private router: Router) { }

  minimumLength: number = 4;
  searchForm = new FormGroup({ 
                    input: new FormControl(this.searchString, 
                      { validators: [Validators.minLength(this.minimumLength), this.noEmptyStringValidator], 
                        updateOn: 'submit'})});


  public onSubmit(form: FormGroup) {
    if (form.valid) {
      this.router.navigate(['search'], { queryParams: { q: form.get('input')?.value, l: this.selectedLang } });
    }
  }

  ngOnChanges() {
    this.searchString = this.searchString.replace(` lang:${this.selectedLang}`, '');
    this.searchForm.get('input')?.setValue(this.searchString);
  }

  openMenu(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.langMenuTrigger?.openMenu();
  }

  public noEmptyStringValidator(control: AbstractControl) : ValidationErrors | null  {
    return (control.value || '').trim().length? null : { emptyString: true };
  }

}
