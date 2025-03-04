import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { ProfileDialogComponent } from '../../dialogs/profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public userService: UserService, private dialog: MatDialog) { }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      autoFocus: false,
      closeOnNavigation: false
    });
  }
}

