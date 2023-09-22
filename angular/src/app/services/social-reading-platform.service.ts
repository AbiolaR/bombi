import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SocialReadingPlatform } from '../models/social-reading-platform';
import { ServerResponse } from '../models/server-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Credentials } from '../models/credentials';
import { SyncRequest } from '../models/sync-request.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocialReadingPlatformService {

  private apiUrl: string = `${environment.apiServerUrl}/v1/users`;

  constructor(private http: HttpClient, private userService: UserService) { }

  public connect(platform: SocialReadingPlatform, credentials: Credentials): Observable<ServerResponse<SyncRequest[]>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<SyncRequest[]>>(`${this.apiUrl}/srp-connection`,
      {platform: platform, credentials: credentials},
      { headers });
  }

  public disconnect(platform: SocialReadingPlatform): Observable<Object> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.delete(`${this.apiUrl}/srp-connection`,
      { body: { platform: platform }, headers: headers });
  }

  public startSync(syncRequests: SyncRequest[]): Observable<ServerResponse<boolean>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<boolean>>(`${this.apiUrl}/srp-sync`,
      { syncRequests: syncRequests }, 
      { headers });
  }

  public syncStatus(syncRequests: SyncRequest[]): Observable<ServerResponse<SyncRequest[]>> {
    const headers = { 'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}`};
    return this.http.post<ServerResponse<SyncRequest[]>>(`${this.apiUrl}/srp-sync/status`,
    { syncRequests: syncRequests }, 
    { headers });
  }
}
