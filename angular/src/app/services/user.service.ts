import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { UserData } from '../models/user-data';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userApiUrl = `${environment.apiServerUrl}/v1/users`;

  constructor(private http: HttpClient) { }

  public login(username: String, password: String): Observable<UserData> {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    return this.http.post<UserData>(
        `${this.userApiUrl}/login`,
        `username=${username}&password=${password}`, 
        { headers }
      );
  }

  public register(user: User): Observable<UserData> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<UserData>(
      `${this.userApiUrl}/login`,
      JSON.stringify(user), 
      { headers }
    );
  }

  public saveUserData(userData: UserData): Observable<boolean> {
    const headers = { 'Content-Type': 'application/json',
                      'Authentication': `Bearer ${this.getUserData()?.access_token}` };
    return this.http.post<boolean>(
      `${this.userApiUrl}/save`,
      JSON.stringify(userData),
      { headers }
    );
  }

  public getUserData(): UserData | undefined {
    try {
      return JSON.parse(localStorage.getItem('userData')!);
    } catch {
      return undefined;
    }
  }

  public setUserData(userData: UserData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  public deleteUserData() {
    localStorage.removeItem('userData');
  }
}
