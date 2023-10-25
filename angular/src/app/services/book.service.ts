import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DownloadMode } from '../models/download-mode';
import { UserService } from './user.service';
import { SearchResult } from '../models/search-result';
import { DeviceDetectorService } from 'ngx-device-detector';

const HALF_A_DAY_IN_MS = 1000 * 60 * 60 * 12;

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl: string = `${environment.apiServerUrl}/v1/books/`;
  private cachedSearches = new Map<string, { searchResult: Observable<SearchResult>, ttl: number }>();

  constructor(private http: HttpClient, private userService: UserService, private deviceDetectorService: DeviceDetectorService) { }

  public search(searchString: string, pageNumber: number): Observable<SearchResult> {
    let query = `q=${searchString}&p=${pageNumber}&m=${!this.deviceDetectorService.isDesktop()}`;
    let cachedSearch = this.cachedSearches.get(query);

    if (!cachedSearch || cachedSearch.ttl < Date.now()) {
      cachedSearch = {
        searchResult: this.getSearchResults(searchString, pageNumber, !this.deviceDetectorService.isDesktop())
        .pipe(shareReplay(1)),
        ttl: Date.now() + HALF_A_DAY_IN_MS
      };
      this.cachedSearches.set(query, cachedSearch);
    }
    return cachedSearch.searchResult;
  }

  private getSearchResults(searchString: String, pageNumber: number, mobileDevice: boolean): Observable<SearchResult> {
    return this.http.get<SearchResult>
    (`${this.apiUrl}search?q=${searchString}&p=${pageNumber}&m=${mobileDevice}`);
  }

  public download(downloadVar: String, mode: DownloadMode): Observable<Blob> {
    var param = '';
    switch(mode) {
      case DownloadMode.BOOK:
        param = 'md5';
        break;
      case DownloadMode.URL:
        param = 'url';
        break;
    }
    return this.http.get(`${this.apiUrl}download?${param}=${downloadVar}`, 
    {responseType: 'blob'});
  }

  public sendToEReader(downloadVar: String, filename: String, mode: DownloadMode): Observable<any> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    var param = '';
    switch(mode) {
      case DownloadMode.BOOK:
        param = 'md5';
        break;
      case DownloadMode.URL:
        param = 'url';
        break;
    }
    return this.http.post<any>(`${this.apiUrl}send`, 
      {[param]: downloadVar, filename: filename},
      { headers });
  }

  public testTolinoAuth(json: Object): Observable<any> {
    return this.http.post<String>(`${this.apiUrl}tolino/test`,
    json);
  }
}