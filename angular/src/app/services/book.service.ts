import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { SearchResult } from '../models/search-result';
import { ServerResponse } from '../models/server-response';
import { Credentials } from '../models/credentials';
import { Book } from '../models/book';
import { PocketBookProvider } from '../models/pocketbook-provider';
import { Language } from '../models/language';
import { LanguageMap } from '../models/language-map';
import { SyncRequest } from '../models/sync-request.model';

const FIFTEEN_MINUTES_IN_MS = 1000 * 60 * 15;
const FIFTEEN_SECONDS_IN_MS = 1000 * 15;

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl: string = `${environment.apiServerUrl}/v1/books/`;
  private cachedSearches = new Map<string, { searchResult: Observable<SearchResult>, ttl: number }>();
  private cachedBookProgri = new Map<string, { bookProgress: Observable<ServerResponse<Book[]>>, ttl: number }>();

  constructor(private http: HttpClient, private userService: UserService) { }

  public search(searchString: string, pageNumber: number): Observable<SearchResult> {
    let defaultLang = this.mapToLanguage(this.userService.getLocalUserData().language 
      || navigator.language);
    let query = `q=${searchString}&p=${pageNumber}&dl=${defaultLang}`;
    let cachedSearch = this.cachedSearches.get(query);

    if (!cachedSearch || cachedSearch.ttl < Date.now()) {
      cachedSearch = {
        searchResult: this.getSearchResults(searchString, defaultLang, pageNumber)
        .pipe(shareReplay(1)),
        ttl: Date.now() + FIFTEEN_MINUTES_IN_MS
      };
      this.cachedSearches.set(query, cachedSearch);
    }
    return cachedSearch.searchResult;
  }

  public searchUpcoming(searchString: String, foundBooks: Book[], selectedLang: string): Observable<SearchResult> {
    return this.http.post<SearchResult>(`${this.apiUrl}search/upcoming`,
    { searchString: searchString, foundBooks: foundBooks, selectedLang: selectedLang });
  }

  public searchByIsbn(isbn: string): Observable<ServerResponse<string>> {
    return this.http.get<ServerResponse<string>>(`${this.apiUrl}search/isbn?isbn=${isbn}`);
  }

  private getSearchResults(searchString: String, defaultLang: string, pageNumber: number): Observable<SearchResult> {
    return this.http.get<SearchResult>
    (`${this.apiUrl}search?q=${searchString}&p=${pageNumber}&dl=${defaultLang}`);
  }

  public download(book: Book): Observable<Blob> {
    return this.http.get(`${this.apiUrl}download?bookData=${encodeURIComponent(JSON.stringify(book))}`,
    { responseType: 'blob' });
  }

  public upload(formData: FormData): Observable<ServerResponse<void>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<void>>(`${this.apiUrl}upload`, formData, { headers });
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

  public getProgress(): Observable<ServerResponse<Book[]>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    const key = headers.Authorization;
    let cachedBookProgress = this.cachedBookProgri.get(key);

    if (!cachedBookProgress || cachedBookProgress.ttl < Date.now()) {
      cachedBookProgress = { 
        bookProgress: this.http.get<ServerResponse<Book[]>>(
          `${this.apiUrl}progress`, { headers }).pipe(shareReplay(1)),
        ttl: Date.now() + FIFTEEN_MINUTES_IN_MS 
      };
      this.cachedBookProgri.set(key, cachedBookProgress);
    }
    
    return cachedBookProgress.bookProgress;
  }

  public getPocketBookProviders(email: string): Observable<ServerResponse<PocketBookProvider[]>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<PocketBookProvider[]>>(
      `${this.apiUrl}pocketbook-cloud/providers`,
      { email: email },
      { headers }
    );
  }

  public connectPocketBookCloud(credentials: Credentials, provider: PocketBookProvider): Observable<ServerResponse<boolean>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<boolean>>(
      `${this.apiUrl}pocketbook-cloud/connect`,
      { credentials: credentials, provider: provider },
      { headers }
    );
  }

  public disconnectPocketBookCloud(): Observable<ServerResponse<void>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.delete<ServerResponse<void>>(`${this.apiUrl}pocketbook-cloud/disconnect`,
      { headers });
  }

  public disconnectTolino(): Observable<ServerResponse<void>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.delete<ServerResponse<void>>(`${this.apiUrl}tolino/disconnect`, { headers });
  }

  public getSyncRequests(): Observable<ServerResponse<SyncRequest[]>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.get<ServerResponse<SyncRequest[]>>(`${this.apiUrl}requests`, { headers });
  }

  private mapToLanguage(lang: string): LanguageMap {
    switch (lang.split('-')[0]) {
      case Language.DE:
        return LanguageMap.A;
      case 'fr':
        return LanguageMap.C;
      case 'es':
        return LanguageMap.D;
      case 'it':
        return LanguageMap.E;    
      default:
        return LanguageMap.B;
    }
  }
}