import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from '../models/book';


@Injectable({
  providedIn: 'root'
})
export class BookService {

  apiUrl: string = `${environment.apiServerUrl}/v1/books/`;

  constructor(private http: HttpClient) { }

  public search(searchString: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}search?q=${searchString}`);
  }

  public download(md5Hash: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}download?md5=${md5Hash}`, 
    {responseType: 'blob'});
  }

  public sendToKindle(md5Hash: string, filename: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}send`, 
      {md5: md5Hash, filename: filename});
  }
}
