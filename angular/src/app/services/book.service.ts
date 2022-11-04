import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from '../models/book';
import { DownloadMode } from '../models/download-mode';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class BookService {

  apiUrl: string = `${environment.apiServerUrl}/v1/books/`;

  constructor(private http: HttpClient, private userService: UserService) { }

  public search(searchString: String, pageNumber: number): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}search?q=${searchString}&p=${pageNumber}`);
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
    const headers = { 'Authorization': `Bearer ${this.userService.getUserData()?.access_token}`};
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
