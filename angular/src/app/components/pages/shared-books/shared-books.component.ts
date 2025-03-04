import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserData } from 'src/app/models/user-data';
import { UserService } from 'src/app/services/user.service';
import { Contact } from 'src/app/models/contact';
import { ServerResponse } from 'src/app/models/server-response';

@Component({
  selector: 'app-shared-books',
  templateUrl: './shared-books.component.html',
  styleUrls: ['./shared-books.component.scss']
})
export class SharedBooksComponent implements OnInit {

  @Input()
  userData: UserData | undefined;

  selectedContact = new Contact();
  chats: Contact[] = [];
  tabIndex = 0;
  isMobileDevice = false;
  
  constructor(public userService: UserService, private dialog: MatDialog) {
      this.isMobileDevice = window.matchMedia("(max-width: 700px)").matches;
  }

  ngOnInit(): void {
    this.userService.getChats().subscribe({
      next: (response: ServerResponse<Contact[]>) => {
        this.chats = response.data;
        if (this.chats.length > 0) {
          this.selectedContact = this.chats[0];
        }
      }
    });
  }

  isMobile() {
    this.isMobileDevice = window.matchMedia("(max-width: 700px)").matches;
  }

  openChatOverview() {
    this.selectedContact = new Contact();
    this.tabIndex = 0;
  }
}
