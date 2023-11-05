import { GoogleBook } from "../google-book.model";

export interface SearchResponse {
    kind: string
    totalItems: number
    items: GoogleBook[]
}