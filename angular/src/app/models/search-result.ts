import { Book } from "./book";

export interface SearchResult {
    books: Book[],
    suggestion: string
}