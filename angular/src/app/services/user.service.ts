import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResetData } from '../models/reset-data';
import { ServerResponse } from '../models/server-response';
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
      `${this.userApiUrl}/register`,
      JSON.stringify(user), 
      { headers }
    );
  }

  public saveUserData(userData: UserData): Observable<boolean> {
    const headers = { 'Content-Type': 'application/json',
                      'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    return this.http.post<boolean>(
      `${this.userApiUrl}/save`,
      JSON.stringify(userData),
      { headers }
    );
  }

  public saveSearchHistory(searchHistory: Map<string, string>) : Observable<boolean> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    this.saveLocalSearchHistory(searchHistory);
    return this.http.post<boolean>(
      `${this.userApiUrl}/save`,
      JSON.stringify(searchHistory, this.replacer),
      { headers }
    );
  }

  public saveLocalSearchHistory(searchHistory: Map<string, string>) {
    let userData = this.getLocalUserData();
    if (userData) {
      userData.searchHistory = searchHistory;
      this.setUserData(userData);
    }
  }

  replacer(key: any, value: any) {
    if(value instanceof Map) {
      return {
        searchHistory: Array.from(value.entries()),
      };
    } else {
      return value;
    }
  }

  replacer2(key: any, value: any) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()),
      };
    } else {
      return value;
    }
  }

  public requestPasswordReset(username: String): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.userApiUrl}/requestPasswordReset`, 
      `{"username": "${username}"}`, { headers });
  }

  public checkPasswordResetHash(hash: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.userApiUrl}/validateResetHash`,
      `{"passwordResetHash": "${hash}"}`, { headers });
  }

  public resetPassword(resetData: ResetData): Observable<ServerResponse> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<ServerResponse>(
      `${this.userApiUrl}/resetPassword`, 
      JSON.stringify(resetData), 
      { headers });
  }

  public getLocalUserData(): UserData  {
    try {
      return Object.assign(new UserData(), JSON.parse(localStorage.getItem('userData')!, this.reviver));
    } catch {
      return new UserData();
    }
  }

  public getUserData(): Observable<UserData> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    return this.http.get<UserData>(
      `${this.userApiUrl}/data`,
      { headers }
    );
  }

  public setUserData(userData: UserData) {
    localStorage.setItem('userData', JSON.stringify(userData, this.replacer2));
  }

  public deleteUserData() {
    localStorage.removeItem('userData');
  }

  public isLoggedIn(): boolean {
    return Boolean(this.getLocalUserData()?.username);
  }

  reviver(key: any, value: any) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }
}
