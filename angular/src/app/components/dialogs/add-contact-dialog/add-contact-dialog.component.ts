import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { NotificationInfo } from 'src/app/models/notification-info';
import { ServerResponse } from 'src/app/models/server-response';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-contact-dialog',
  templateUrl: './add-contact-dialog.component.html',
  styleUrls: ['./add-contact-dialog.component.scss']
})
export class AddContactDialogComponent {

  username = '';

  constructor(private dialogRef: MatDialogRef<AddContactDialogComponent>, private snackBar: MatSnackBar,
    private translate: TranslateService, private userService: UserService) {
  }

  public sendFriendRequest() {
    if (this.username) {
      const currentUser = this.userService.getLocalUserData().username;
      let notificationData = new NotificationInfo(`Friend request from ${currentUser}`,
      `${currentUser} would like to be able to share books wih you`);
      this.userService.sendFriendRequest(this.username, notificationData).subscribe({
        next: (response: ServerResponse<boolean>) => {
          switch(response.status) {
            case 0:
              this.translate.stream('sent-friend-request-to', { arg: this.username }).subscribe((translation) => {
                this.snackBar.open(translation, '', { duration: 4000});
                this.dialogRef.close();
              });
              break;
            case 2:
              console.warn('username does not exist');
              break;
          }
        }
      });      
    }
  }

}
