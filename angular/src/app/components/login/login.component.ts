import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserData } from 'src/app/models/user-data';
import { EventService } from 'src/app/services/event.service';
import { UserService } from 'src/app/services/user.service';
import { RegisterDialogComponent } from '../dialogs/register-dialog/register-dialog.component';
import { ResetPasswordDialogComponent } from '../dialogs/reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', {validators: [Validators.minLength(4)], updateOn: 'submit'}),
    password: new FormControl('', {validators: [Validators.minLength(4)], updateOn: 'submit'})
  });

  usernameError: String = '';
  passwordError: String = '';

  constructor(private userService: UserService, private dialog: MatDialog, private eventService: EventService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.clearErrors();
    this.userService.deleteUserData();

    this.userService.login(this.loginForm.get('username')?.value || '', 
      this.loginForm.get('password')?.value || '').subscribe({
      next: (userData: UserData) => {                
        if (userData.username) {
          this.userService.setUserData(userData);
        } else {
          switch(userData.status) {
            case 2:
              this.loginForm.get('password')?.setErrors({unauthenticated: true})
              this.passwordError = 'Wrong password';
              break;
            case 3:
              this.loginForm.get('username')?.setErrors({unauthenticated: true})
              this.usernameError = 'User does not exist';
              break;
          }
        }
      }
    })
  }

  openRegisterDialog() {  
    this.eventService.closeLoginMenu();  
    this.dialog.open(RegisterDialogComponent, {
      width: '500px'
    })
  }

  openForgotPasswordDialog() {
    this.dialog.open(ResetPasswordDialogComponent, {
      width: '300px',
      autoFocus: false,
      data: {
        username: this.loginForm.get('username')?.value
      }
    })
  }

  private clearErrors() {
    this.usernameError = '';
    this.passwordError = '';
    this.loginForm.get('username')?.setErrors(null);
    this.loginForm.get('password')?.setErrors(null);
  }

}