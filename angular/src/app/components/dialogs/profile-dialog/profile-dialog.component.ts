import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserData } from 'src/app/models/user-data';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {

  userData: UserData | undefined;

  constructor(private userService: UserService, private dialogRef: MatDialogRef<ProfileDialogComponent>) { }

  ngOnInit(): void {
    this.userData = this.userService.getLocalUserData();
  }

  logout(): void {
    this.userService.deleteUserData();
    this.close();
  }

  save(): void {
    if (this.userData) {
      this.userService.saveUserData(this.userData.removeStarred()).subscribe({
        next: (success) => {
          if (success) {            
            if (this.userData) {
              this.userData.sanitize();
              this.userService.setUserData(this.userData.removeEmpty());
            }
            this.close();
          } else {
            console.warn('there was an error saving the user: ', success);
          }
        }
      })
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  dataHasChanged(): boolean {
    return JSON.stringify(this.userData?.removeEmpty()) 
            !== JSON.stringify(this.userService.getLocalUserData()?.removeEmpty());
  }
}