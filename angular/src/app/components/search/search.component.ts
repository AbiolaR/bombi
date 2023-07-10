import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  constructor(private router: Router) { }

  minimumLength: number = 4;
  searchForm = new FormGroup({ 
                    input: new FormControl(this.searchString, 
                      { validators: [Validators.minLength(this.minimumLength)], 
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

}
