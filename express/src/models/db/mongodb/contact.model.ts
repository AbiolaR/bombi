import { Book } from "../book.model";

export interface Contact {
    name: string,
    unreadMessages: number,
    sharedBooks: Book[]
}