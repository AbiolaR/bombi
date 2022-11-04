import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  @Input()
  searchString = '';

  constructor(private router: Router) { }

  minimumLength: number = 4;
  searchForm = new FormGroup({ 
                    input: new FormControl(this.searchString, 
                      { validators: [Validators.minLength(this.minimumLength)], 
                        updateOn: 'submit'})});


  public onSubmit(form: FormGroup) {
    if (form.valid) {
      this.router.navigate(['search'], { queryParams: { q: form.get('input')?.value } });
    }
  }

  ngOnChanges() {
    this.searchForm.get('input')?.setValue(this.searchString);
  }

}
