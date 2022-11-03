import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from '../models/book';
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

  public download(md5Hash: String): Observable<Blob> {
    return this.http.get(`${this.apiUrl}download?md5=${md5Hash}`, 
    {responseType: 'blob'});
  }

  public sendToEReader(md5Hash: String, filename: String): Observable<any> {
    const headers = { 'Authorization': `Bearer ${this.userService.getUserData()?.access_token}`};
    return this.http.post<any>(`${this.apiUrl}send`, 
      {md5: md5Hash, filename: filename},
      { headers });
  }

  public testTolinoAuth(json: Object): Observable<any> {
    return this.http.post<String>(`${this.apiUrl}tolino/test`,
    json);
  }
}
