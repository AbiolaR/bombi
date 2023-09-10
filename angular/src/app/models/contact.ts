import { Book } from "./book";

export class Contact {
    name: string = '';
    unreadMessages: number = 0;
    sharedBooks: Book[] = [];

    constructor(name: string = '', unreadMessages: number = 0) {
        this.name = name;
        this.unreadMessages = unreadMessages;
    }
}