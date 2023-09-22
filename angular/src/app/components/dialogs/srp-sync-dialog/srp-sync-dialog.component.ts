import { Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { EMPTY, delay, expand } from 'rxjs';
import { Credentials } from 'src/app/models/credentials';
import { ServerResponse } from 'src/app/models/server-response';
import { SocialReadingPlatform } from 'src/app/models/social-reading-platform';
import { SyncRequest } from 'src/app/models/sync-request.model';
import { SyncStatus } from 'src/app/models/sync-status.model';
import { UserData } from 'src/app/models/user-data';
import { SocialReadingPlatformService } from 'src/app/services/social-reading-platform.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-srp-sync-dialog',
  templateUrl: './srp-sync-dialog.component.html',
  styleUrls: ['./srp-sync-dialog.component.scss']
})
export class SrpSyncDialogComponent {
  connecting = false;
  errorText = '';
  syncStarted = false;
  credentials: Credentials = new Credentials();
  foundBooks: SyncRequest[] = [];
  booksToSync: SyncRequest[] = [];
  syncStatus: typeof SyncStatus = SyncStatus;
  userData: UserData = new UserData();

  @Output()
  foundBooksChange: EventEmitter<SyncRequest[]> = new EventEmitter<SyncRequest[]>;

  constructor(@Inject(MAT_DIALOG_DATA) public platform: SocialReadingPlatform, 
    private dialogRef: MatDialogRef<SrpSyncDialogComponent>, userService: UserService,
    private srpService: SocialReadingPlatformService) {
      this.userData = userService.getLocalUserData();
  }

  ngOnDestroy() {
    this.booksToSync = [];
  }

  close() {
    this.dialogRef.close(this.syncStarted);
  }

  submit(event: any) {
    if (event?.key == 'Enter' && this.credentials.valid()) {
      this.connect();
    }
  }

  connect() {
    this.connecting = true;
    this.errorText = '';
    this.srpService.connect(this.platform, this.credentials).subscribe({        
      next: (response: ServerResponse<SyncRequest[]>) => {
        this.connecting = false;
        switch (response.status) {
          case 0:
            this.foundBooks = response.data;
            this.foundBooksChange.emit(this.foundBooks);
            break;
          case 2:
            this.errorText = 'Could not connect due to invalid credentials';  
            break;  
          default:
            this.errorText = 'An error occured, please try again or contact the Bombi owner';
            break;
        }
      },
      error: () => {
        this.connecting = false;
        this.errorText = 'Could not reach server, please try again in a few minutes or contact the Bombi owner';
      }
    });    
  }

  sync() {
    this.booksToSync = this.foundBooks.filter((book) => book.status == SyncStatus.WAITING);
    this.syncStarted = true;
    this.foundBooksChange.emit([]);
    this.srpService.startSync(this.foundBooks).subscribe({
      next: (response) => {
        switch (response.status) {
          case 0:
            this.pollSyncStatus();
            break;
          default:
            console.log('Error: ', response.message);
            break;
        }
      }
    });
    if (this.booksToSync.length == 0) {
      this.close();
    }
  }

  pollSyncStatus(): void {
    this.srpService.syncStatus(this.booksToSync).pipe(delay(5000), expand(
      () => !this.syncComplete() 
      ? this.srpService.syncStatus(this.booksToSync).pipe(delay(5000)) : EMPTY
    )).subscribe({
      next: (response) => {
        switch (response.status) {
          case 0:
            if (this.booksToSync.length == response.data.length) {
              this.booksToSync = response.data;
            }
            break;
          default:
            console.log('Error: ', response.message);
            break;
        }
      }
    });
  }

  syncComplete(): boolean {
    return (this.booksToSync.filter((book) => book.status == SyncStatus.WAITING).length == 0);
  }

  syncProgress(): number {
    const syncedBooks = this.booksToSync.filter((book) => book.status != SyncStatus.WAITING).length
    return syncedBooks / this.booksToSync.length * 100;
  }

  getEReader(): string {
    switch(this.userData.eReaderType) {
      case 'K':
        return 'Kindle'
      case 'T':
        return 'Tolino';
      default:
        return 'E-Reader';
    }
  }

  syncAmount(): number {
    return this.foundBooks.filter((book) => book.status == SyncStatus.WAITING).length;
  }
}
