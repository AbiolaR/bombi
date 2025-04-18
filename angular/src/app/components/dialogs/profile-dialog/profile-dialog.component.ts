import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Language } from 'src/app/models/language';
import { Router } from '@angular/router';
import { UserData } from 'src/app/models/user-data';
import { AppService } from 'src/app/services/app.service';
import { UserService } from 'src/app/services/user.service';
import { Contact } from 'src/app/models/contact';
import { AddContactDialogComponent } from '../add-contact-dialog/add-contact-dialog.component';
import { NotificationInfo } from 'src/app/models/notification-info';
import { SwPush } from '@angular/service-worker';
import { MatExpansionPanel } from '@angular/material/expansion';
import { CommunicationService } from 'src/app/services/communication.service';

const PUBLIC_VAPID_KEY = 'BKoDZzDgSyM4qGa9wvX_u3udANeC-8Cn3JGmSfJKfUEp37edT0JFNXl85w_QfsK7ft7NjwJneG7Wz6HmTynRCuU';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {

  ADMIN_ROLE = 'admin';

  userData: UserData | undefined;
  Language = Language;
  selectedLanguage = '';
  showNotificationButton = false;
  eReaderEmailSaved = false;
  isAdmin = false;
  allowedUrls: string[] = ['/shared', '/progress', '/requests'];

  @ViewChild('settingsPanel') settingsPanel: MatExpansionPanel | undefined;
  @ViewChild('ebrPanel') ebrPanel: MatExpansionPanel | undefined;

  constructor(public userService: UserService, private appService: AppService, private swPush: SwPush,
    private router: Router, private dialogRef: MatDialogRef<ProfileDialogComponent>, 
    private dialog: MatDialog, @Inject(MAT_DIALOG_DATA) private missingEreader: boolean,
    private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.communicationService.setAllowedNavigationUrls(this.allowedUrls);
    this.showNotificationButton = window.Notification && Notification.permission != 'granted';
    this.userService.updateUserData().subscribe({
      next: (userData: UserData) => {
        this.userData = userData; 
        this.selectedLanguage = userData.language;
        this.eReaderEmailSaved = !!userData.eReaderEmail;

        if (this.missingEreader) {
          this.openEreaderSettings();
        }

        this.userService.getRole().subscribe({
          next: (response) => {
            if (response.data === this.ADMIN_ROLE) {
              this.isAdmin = true;
            }
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.communicationService.setAllowedNavigationUrls([]);
  }

  openEreaderSettings() {
    this.settingsPanel!.expanded = true;
    setTimeout(() => {
      this.ebrPanel!.expanded = true;
    }, 0);
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
              this.eReaderEmailSaved = !!this.userData.eReaderEmail;
              this.communicationService.changeEReaderType(this.userData.eReaderType)
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

  navigateTo(url: string) {
    this.router.navigateByUrl(url);
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

  requestNotificationPermission() {
    this.swPush.requestSubscription({serverPublicKey: PUBLIC_VAPID_KEY})
    .then(subscription => {
      this.userService.getUserData().subscribe({
        next: (userData) => {            
          userData.pushSubscriptions.push(subscription);
          this.userService.saveUserDataProperty('pushSubscriptions', userData.pushSubscriptions).subscribe(() => {
            this.showNotificationButton = false;
            this.userService.updateUserData().subscribe({
              next: (userData: UserData) => {
                this.userData = userData;
              }
            })
          });
        }
      });
    })
    .catch();
  }

  scrollIntoView(panel: MatExpansionPanel) {
    panel._body.nativeElement.scrollIntoView({behavior: 'smooth'})
  }

  private deleteFriendRequest(username: string) {
    if (this.userData) {
      this.userData.friendRequests.splice(this.userData.friendRequests.indexOf(username),1);
      this.userService.saveUserDataProperty('friendRequests', this.userData.friendRequests).subscribe({});
    }
  }

}