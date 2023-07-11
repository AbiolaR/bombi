import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/models/user';
import { UserData } from 'src/app/models/user-data';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent {

  user: User = new User();

  constructor(private userService: UserService, private dialogRef: MatDialogRef<RegisterDialogComponent>) { }

  register(): void {
    if (this.user) {
      this.userService.register(this.user).subscribe({
        next: (userData: UserData) => {
          if (userData.username) {
            this.userService.setUserData(userData);
            this.close();
          } else {
            console.warn('theres been an error while trying to register');
          }
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
