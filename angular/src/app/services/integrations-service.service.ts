import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ServerResponse } from '../models/server-response';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsServiceService {

  private integrationsApiUrl = `${environment.apiServerUrl}/v1/integrations`;
  
  constructor(private http: HttpClient, private userService: UserService) { }

  public getGoogleAuthUrl(): Observable<ServerResponse<string>> {
    const headers = { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.userService.getLocalUserData()?.access_token}` };

    return this.http.get<ServerResponse<string>>(`${this.integrationsApiUrl}/google/auth-url`, { headers });
  }
}
