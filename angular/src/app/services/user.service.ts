import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResetData } from '../models/reset-data';
import { ServerResponse } from '../models/server-response';
import { User } from '../models/user';
import { UserData } from '../models/user-data';
import { Book } from '../models/book';
import { Contact } from '../models/contact';
import { NotificationInfo } from '../models/notification-info';

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

  public saveUserDataProperty(key: keyof UserData, value: UserData[keyof UserData]) {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    this.saveLocalUserDataProperty(key, value);

    return this.http.post<boolean>(
        `${this.userApiUrl}/save`,
        Object.fromEntries(new Map([[key, value]])),
        { headers }
      );
  }

  public saveLocalUserDataProperty<UserDataKey extends keyof UserData>
  (key: UserDataKey, value: UserData[UserDataKey]) {
    let userData = this.getLocalUserData();
    if (userData) {
      userData[key] = value;
      this.setUserData(userData);
    }
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

  public shareBook(contact: string, book: Book, notificationInfo: NotificationInfo) : Observable<ServerResponse<boolean>> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    return this.http.post<ServerResponse<boolean>>(
      `${this.userApiUrl}/share`,
      Object.fromEntries([['contact', contact], ['book', book], ['notificationData', notificationInfo]]),
      { headers }
    )
  }

  public getSharedBooks(contact: string = '') : Observable<ServerResponse<Book[]>> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    return this.http.get<ServerResponse<Book[]>>(
      `${this.userApiUrl}/shared?contact=${contact}`,
      { headers }
    );
  }

  public getChats() : Observable<ServerResponse<Contact[]>> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };
    return this.http.get<ServerResponse<Contact[]>>(
      `${this.userApiUrl}/shared`,
      { headers }
    )
  }

  public sendFriendRequest(username: string, notificationData: NotificationInfo) : Observable<ServerResponse<boolean>> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };

    return this.http.post<ServerResponse<any>>(
      `${this.userApiUrl}/friend-request/send`,
      { contactUsername: username, notificationData: notificationData },
      { headers }
    )
  }

  public acceptFriendRequest(username: string, notificationData: NotificationInfo) : Observable<ServerResponse<boolean>> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getLocalUserData()?.access_token}` };

    return this.http.post<ServerResponse<any>>(
      `${this.userApiUrl}/friend-request/accept`,
      { contactUsername: username, notificationData: notificationData },
      { headers }
    )
  }

  public openNotifications() : number {
    return this.unreadMessages() + this.getLocalUserData().friendRequests.length;
  }

  public unreadMessages() : number {
    let amount = 0
    this.getLocalUserData().contacts.forEach(contact => {
      amount += contact.unreadMessages || 0;
    })
    return amount;
  }

  public updateUserData() : Observable<UserData> {
    return new Observable(subscriber => {
      this.getUserData().pipe(
        take(1)
      ).subscribe(userData => {
        userData.access_token = this.getLocalUserData().access_token;
        userData = Object.assign(new UserData, userData);
        this.setUserData(userData);
        subscriber.next(userData);
      });
    });   
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

  public resetPassword(resetData: ResetData): Observable<ServerResponse<boolean>> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post<ServerResponse<boolean>>(
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
