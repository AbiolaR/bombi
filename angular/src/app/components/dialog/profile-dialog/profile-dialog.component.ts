import { Dialog } from '@angular/cdk/dialog';
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
  activeEReader: number = 0;


  constructor(private userService: UserService, private dialogRef: MatDialogRef<ProfileDialogComponent>) { }

  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    switch (this.userData?.eReader) {
      case 'K': // Kindle
        this.activeEReader = 0;
        break;
      case 'T': // Tolino
        this.activeEReader = 1;
        break;
    }
  }

  logout(): void {
    this.userService.deleteUserData();
    this.close();
  }

  save(): void {
    if (this.userData) {
      this.userService.saveUserData(this.userData).subscribe({
        next: (success) => {
          if (success) {
            if (this.userData) this.userService.setUserData(this.userData);
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
    return JSON.stringify(this.removeEmpty(this.userData)) 
            !== JSON.stringify(this.removeEmpty(this.userService.getUserData()));
  }

  setEReader(index: any): void {
    if (!this.userData) return;
    switch(index) {
      case 0: // Kindle
        this.userData.eReader = 'K';
        break;
      case 1: // Tolino
        this.userData.eReader = 'T';
        break;
    }
  }

  private removeEmpty(userData: UserData | undefined) {
    if (!userData) {
      return {};
    }
    return Object.fromEntries(Object.entries(userData).filter(([_, v]) => v != ''));
  }

}
