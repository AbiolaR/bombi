import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ResetData } from 'src/app/models/reset-data';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  hash: string | null = null;
  resetData: ResetData = new ResetData();
  resetForm = new FormGroup({
    username: new FormControl('', {validators: [Validators.minLength(4)], updateOn: 'submit'}),
    password: new FormControl('', {validators: [Validators.minLength(4)], updateOn: 'submit'}),
    repeatPassword: new FormControl('', {validators: [Validators.minLength(4)], updateOn: 'submit'})
  });
  passwordError: String = '';
  repeatPasswordError: String = '';
  isLoading = true;
  button: HTMLElement | null = null;
  buttonText = 'Reset Password';
  
  constructor(private activatedRoute: ActivatedRoute, private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.hash = this.activatedRoute.snapshot.paramMap.get('hash');
    if(!this.hash) {
      this.isLoading = false
      return;
    }
    this.userService.checkPasswordResetHash(this.hash).subscribe({
      next: (response) => {
        if(response.status == 0) {
          this.resetData.username = response.username;
          this.resetForm.get('username')?.setValue(this.resetData.username);
        }
        this.isLoading = false
      }
    });
  }

  resetPassword() {
    this.button = document.getElementById('submitButton');
    if (this.buttonText != 'Reset Password') {
      this.router.navigateByUrl('/');
      return;
    }
    this.clearErrors();
    if(!this.resetForm.get('password')?.value) {
      this.passwordError = 'Please enter your password';
      this.resetForm.get('password')?.setErrors({unauthenticated: true});
      return;
    }
    if(!this.resetForm.get('repeatPassword')?.value) {
      this.repeatPasswordError = 'Please repeat your password';
      this.resetForm.get('repeatPassword')?.setErrors({unauthenticated: true});
      return;
    }
    if(this.resetForm.get('password')?.value != this.resetForm.get('repeatPassword')?.value) {
      this.repeatPasswordError = 'Your passwords don\'t match';
      this.resetForm.get('repeatPassword')?.setErrors({unauthenticated: true});
      return;
    }

    this.resetData.password = this.resetForm.get('password')?.value || '';
    this.button?.classList.add('loading');
    this.userService.resetPassword(this.resetData).subscribe({
      next: (response) => {
        switch(response.status) {
          case 0:
            this.button?.classList.remove('loading');
            this.button?.classList.add('success');
            setTimeout(() => {
              this.button?.classList.remove('success');
              this.buttonText = 'Go to search page';
            }, 2000);
            break;
          default:
            this.button?.classList.remove('loading');
            this.button?.classList.add('failure');
        }
      }
    });
  }

  private clearErrors() {
    this.passwordError = '';
    this.repeatPasswordError = '';
    this.resetForm.get('password')?.setErrors(null);
    this.resetForm.get('repeatPassword')?.setErrors(null);
  }

}
