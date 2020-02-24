import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommonDataService } from './common-data.service';
import { ProfileService } from '@services/data-services/profile.service';

import { ItokenPayload } from '@interfaces/tokenPayload';
import { ItokenResponse } from '@interfaces/tokenResponse';

import { SentryMonitorService } from './../sentry-monitor.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token: string;
  private userAuth = new Subject<boolean>();
  userAuth$ = this.userAuth.asObservable();

  constructor(private http: HttpClient,
              private profileSvc: ProfileService,
              private sentryMonitorSvc: SentryMonitorService,
              private commonData: CommonDataService) { }


    public getUsername(): Observable<any> {
      const dataSvcURL = this.commonData.getLocation();
      return this.http.get(`${dataSvcURL}/username`,
      { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }

    public handleBackendError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    if (error.status === 401) {
      return;
    } else {
      // return throwError(errorMessage);
    }
  }

   public isLoggedIn(): boolean {
    const token = this.getLocalToken();
    if (token) {
      return token.tokenExpire > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public login(user: ItokenPayload): Observable<any> {
    let base;
    const dataSvcURL = this.commonData.getLocation();
    base = this.http.post(`${dataSvcURL}/login`, user);
    const request = base.pipe(
      map((data: ItokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        this.sentryMonitorSvc.monitorUser(user);
        return data;
      })
    );
    return request;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('rvlikeme-token');
    this.profileSvc.getProfile(true);
    this.profileSvc.dispose();
  }

  public registerUser(user: ItokenPayload): Observable<any> {
    let base;
    const dataSvcURL = this.commonData.getLocation();
    base = this.http.post(`${dataSvcURL}/register`, user);
    const request = base.pipe(
      map((data: ItokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        this.sentryMonitorSvc.monitorUser(user);
        return data;
      })
    );
    return request;
  }

  public setUserToAuthorized(auth: boolean): void {
    this.userAuth.next(auth);
  }

  public updateUsername(user: ItokenPayload): Observable<any> {
    const dataSvcURL = this.commonData.getLocation();
    return this.http.patch(`${dataSvcURL}/username`, user,
    { headers: { Authorization: `Bearer ${this.getToken()}` }});
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('rvlikeme-token');
    }
    return this.token;
  }

  private getLocalToken(): ItokenPayload {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      this.sentryMonitorSvc.monitorUser(JSON.parse(payload));
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  private saveToken(token: string): void {
    localStorage.setItem('rvlikeme-token', token);
    this.token = token;
  }
}
