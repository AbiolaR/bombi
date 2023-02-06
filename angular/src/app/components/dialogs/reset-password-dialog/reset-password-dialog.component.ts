import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.scss']
})
export class ResetPasswordDialogComponent implements OnInit {
  resetForm = new FormGroup({
    username: new FormControl('', {validators: [Validators.minLength(4)], updateOn: 'submit'})
  });
  usernameError: String = '';
  @ViewChild('submitButton', {static: true})
  button!: any;
  processStarted = false;
  email = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private userService: UserService) {
    this.resetForm.get('username')?.setValue(data.username);
  }

  ngOnInit(): void {
    console.log(this.button)
  }

  resetPassword() {
    if (this.processStarted) {
      return;
    }
    this.clearErrors();
    const username = this.resetForm.get('username')?.value;
    if (!username) {
      this.usernameError = 'Please enter a username';
      this.resetForm.get('username')?.setErrors({unauthenticated: true});
      return;
    }
    this.userService.requestPasswordReset(username).subscribe({
      next: (response) => {
        switch(response.status) {
          case 0:
            this.button._elementRef.nativeElement.classList.add('success');
            this.email = response.email;
            this.processStarted = true;
            break;
          default:
            this.usernameError = 'No user found matching the given username';
            this.resetForm.get('username')?.setErrors({unauthenticated: true});
        }
      }
    });
  }

  private clearErrors() {
    this.usernameError = '';
    this.resetForm.get('username')?.setErrors(null);
  }

}
