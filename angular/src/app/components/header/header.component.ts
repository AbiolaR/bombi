import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../dialogs/profile-dialog/profile-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild(MatMenuTrigger) loginMenu: MatMenuTrigger | undefined;

  @Input()
  searchString = '';

  @Input()
  performScan = false;

  constructor(public userService: UserService, private dialog: MatDialog, private eventService: EventService) {
    eventService.menuEvent.subscribe(this.toggleLoginMenu.bind(this))
  }

  openProfileDialog() {
    this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      autoFocus: false,
      closeOnNavigation: false
    });
  }

    private toggleLoginMenu(state: boolean) {
      if (state) {
        this.loginMenu?.openMenu();
      } else {
        this.loginMenu?.closeMenu();
      }
    }
}
