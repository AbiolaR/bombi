import { Component, Input, OnInit } from '@angular/core';
import { Book } from 'src/app/models/book';
import { Contact } from 'src/app/models/contact';
import { ServerResponse } from 'src/app/models/server-response';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent  {

  @Input()
  contact: Contact = new Contact();

  books: Book[] = [];

  constructor(private userService: UserService) { }

  ngOnChanges(): void {
    if (!this.contact.name) {
      return;
    }
    this.userService.getSharedBooks(this.contact.name).subscribe({
      next: (response: ServerResponse<Book[]>) => {
        if (response.status == 0) {
          this.books = response.data;
        }
      }
    });
  }

}
