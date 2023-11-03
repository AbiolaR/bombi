import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DownloadMode } from '../models/download-mode';
import { UserService } from './user.service';
import { SearchResult } from '../models/search-result';
import { ServerResponse } from '../models/server-response';
import { Credentials } from '../models/credentials';
import { Book } from '../models/book';

const FIFTEEN_MINUTES_IN_MS = 1000 * 60 * 15;

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl: string = `${environment.apiServerUrl}/v1/books/`;
  private cachedSearches = new Map<string, { searchResult: Observable<SearchResult>, ttl: number }>();

  constructor(private http: HttpClient, private userService: UserService) { }

  public search(searchString: string, pageNumber: number): Observable<SearchResult> {
    let query = `q=${searchString}&p=${pageNumber}`;
    let cachedSearch = this.cachedSearches.get(query);

    if (!cachedSearch || cachedSearch.ttl < Date.now()) {
      cachedSearch = {
        searchResult: this.getSearchResults(searchString, pageNumber)
        .pipe(shareReplay(1)),
        ttl: Date.now() + FIFTEEN_MINUTES_IN_MS
      };
      this.cachedSearches.set(query, cachedSearch);
    }
    return cachedSearch.searchResult;
  }

  private getSearchResults(searchString: String, pageNumber: number): Observable<SearchResult> {
    return this.http.get<SearchResult>
    (`${this.apiUrl}search?q=${searchString}&p=${pageNumber}`);
  }

  public download(book: Book): Observable<Blob> {
    return this.http.get(`${this.apiUrl}download?bookData=${encodeURIComponent(JSON.stringify(book))}`,
    { responseType: 'blob' });
  }

  public sendToEReader(book: Book): Observable<any> {
    
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<any>(`${this.apiUrl}send`, 
      { bookData: book },
      { headers });
  }

  public connectTolino(credentials: Credentials): Observable<ServerResponse<void>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<void>>(`${this.apiUrl}tolino/connect`,
    { credentials },
    { headers });
  }

  public disconnectTolino(): Observable<ServerResponse<void>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.delete<ServerResponse<void>>(`${this.apiUrl}tolino/disconnect`, { headers });
  }
}