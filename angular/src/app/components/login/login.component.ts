import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserData } from 'src/app/models/user-data';
import { UserService } from 'src/app/services/user.service';
import { RegisterDialogComponent } from '../dialogs/register-dialog/register-dialog.component';

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

  constructor(private userService: UserService, private dialog: MatDialog) { }

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
    this.dialog.open(RegisterDialogComponent, {
      width: '500px'
    })
  }

  private clearErrors() {
    this.usernameError = '';
    this.passwordError = '';
    this.loginForm.get('username')?.setErrors(null);
    this.loginForm.get('password')?.setErrors(null);
  }

}