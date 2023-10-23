import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserRelatedData } from 'src/app/models/user-related-data';
import { SocialReadingPlatform } from 'src/app/models/social-reading-platform';
import { SocialReadingPlatformService } from 'src/app/services/social-reading-platform.service';
import { MatDialog } from '@angular/material/dialog';
import { SrpSyncDialogComponent } from '../dialogs/srp-sync-dialog/srp-sync-dialog.component';
import { UserService } from 'src/app/services/user.service';
import { UserData } from 'src/app/models/user-data';
import { SyncRequest } from 'src/app/models/sync-request.model';

@Component({
  selector: 'app-social-reading-platform-config',
  templateUrl: './social-reading-platform-config.component.html',
  styleUrls: ['./social-reading-platform-config.component.scss']
})
export class SocialReadingPlatformConfigComponent {

  @Input()
  userData: UserData = new UserData();
  @Output()
  userDataChange: EventEmitter<UserData> = new EventEmitter<UserData>();
  
  socialReadingPlatform = SocialReadingPlatform;  
  selectedSRP: SocialReadingPlatform = SocialReadingPlatform.GOODREADS;
  
  private foundBooks: SyncRequest[] = [];
  disconnecting = false;

  constructor(private socialReadingPlatformService: SocialReadingPlatformService, 
    private dialog: MatDialog, private userService: UserService, 
    private srpService: SocialReadingPlatformService) {}

  isConnected(): boolean {
    switch (this.selectedSRP) {
      case SocialReadingPlatform.GOODREADS:
        return (this.userData.grUserId 
          && this.userData.grCookies && this.userData.grCookies.length > 0) as boolean;
    
      case SocialReadingPlatform.THE_STORY_GRAPH:
        return (this.userData.tsgUsername 
          && this.userData.tsgCookies && this.userData.tsgCookies.length > 0) as boolean;
    }
  }

  connect() {
    const dialogRef = this.dialog.open(SrpSyncDialogComponent, {
      width: '500px',
      data: this.selectedSRP
    });

    const foundBooksChange = dialogRef.componentInstance.foundBooksChange
      .subscribe((syncRequests) => {
        this.foundBooks = syncRequests;
      })
    
    dialogRef.afterClosed().subscribe({
      next: (cleanReturn) => {
        this.updateUserData();
        if (!cleanReturn && this.foundBooks.length > 0) {
          this.srpService.startSync(this.foundBooks).subscribe({});
        }
        foundBooksChange.unsubscribe();
      }
    });

  }

  disconnect() {
    this.disconnecting = true;
    this.socialReadingPlatformService.disconnect(this.selectedSRP).subscribe({
      next: () => {
        this.updateUserData();
        this.disconnecting = false;
      }
    });
  }

  private updateUserData() {
    this.userService.updateUserData().subscribe({
      next: (userData: UserData) => {
        this.userData = userData;
        this.userDataChange.emit(userData);
      }
    });
  }

}