import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Language } from 'src/app/models/language';
import { Router } from '@angular/router';
import { UserData } from 'src/app/models/user-data';
import { AppService } from 'src/app/services/app.service';
import { UserService } from 'src/app/services/user.service';
import { Contact } from 'src/app/models/contact';
import { AddContactDialogComponent } from '../add-contact-dialog/add-contact-dialog.component';
import { NotificationInfo } from 'src/app/models/notification-info';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {

  userData: UserData | undefined;
  Language = Language;
  selectedLanguage = '';

  constructor(public userService: UserService, private appService: AppService,
    private router: Router, private dialogRef: MatDialogRef<ProfileDialogComponent>, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.userService.updateUserData().subscribe({
      next: (userData: UserData) => {
        this.userData = userData; 
        this.selectedLanguage = userData.language;
      }
    });
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

  setLanguage(language: Language) {
    if (this.userData) {
      this.userData.language = language;
    }
    this.appService.setLanguage(language) 
  }

  navigateToSharedBooks() {
    this.router.navigateByUrl('shared');
    this.close();
  }

  contactAmount() : number {
    return (this.userData?.contacts.length || 0) + (this.userData?.friendRequests.length || 0);
  }

  openAddContactDialog() {
    this.dialog.open(AddContactDialogComponent, {
      width: '500px'
    })
  }

  acceptFriendRequest(username: string) {
    if (this.userData) {
      this.deleteFriendRequest(username);
      this.userData.contacts.push(new Contact(username));
      this.userService.saveLocalUserDataProperty('contacts', this.userData.contacts);
      let notificationData = new NotificationInfo('Friend request accepted',
       `${this.userData.username} accepted your friend request\nYou can now share books with them`);
      this.userService.acceptFriendRequest(username, notificationData).subscribe({});
    }
  }

  declineFriendRequest(username: string) {
    this.deleteFriendRequest(username);
  }



  private deleteFriendRequest(username: string) {
    if (this.userData) {
      this.userData.friendRequests.splice(this.userData.friendRequests.indexOf(username),1);
      this.userService.saveUserDataProperty('friendRequests', this.userData.friendRequests).subscribe({});
    }
  }

}