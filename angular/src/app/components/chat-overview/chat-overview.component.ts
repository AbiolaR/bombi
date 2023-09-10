import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Contact } from 'src/app/models/contact';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-chat-overview',
  templateUrl: './chat-overview.component.html',
  styleUrls: ['./chat-overview.component.scss']
})
export class ChatOverviewComponent {

  @Input()
  contacts: Contact[] = [];
  
  @Input()
  selectedContact: Contact = new Contact();
  @Output()
  selectedContactChange = new EventEmitter<Contact>();

  @Input()
  tabIndex = 0;
  @Output()
  tabIndexChange = new EventEmitter<number>();

  constructor(private userService: UserService) {}

  openChat(contact: Contact) {
    this.selectedContact = contact;
    this.tabIndex = 1;
    this.selectedContactChange.emit(this.selectedContact);
    this.tabIndexChange.emit(this.tabIndex);
    this.contacts[this.contacts.indexOf(contact)].unreadMessages = 0;
    this.userService.saveUserDataProperty('contacts', this.contacts).subscribe();
  }
}
