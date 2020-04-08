import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

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
              private sentryMonitorSvc: SentryMonitorService) { }


  getUsername(): Observable<any> {
    return this.http.get(`/api/username`);
  }

  handleBackendError(error) {
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

  isLoggedIn(): boolean {
    const token = this.getLocalToken();
    if (token) {
      return token.tokenExpire > Date.now() / 1000;
    } else {
      return false;
    }
  }

  login(user: ItokenPayload): Observable<any> {
    let base;
    base = this.http.post(`/api/login`, user);
    const request = base.pipe(
      map((data: ItokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
          // console.log('TOKEN=', data.token);
        }
        this.sentryMonitorSvc.monitorUser(user);
        return data;
      })
    );
    return request;
  }

  logout(): void {
    this.token = '';
    window.localStorage.removeItem('rvlikeme-token');
    this.profileSvc.getProfile(true);
  }

  registerUser(user: ItokenPayload): Observable<any> {
    let base;
    base = this.http.post(`/api/register`, user);
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

  setUserToAuthorized(auth: boolean): void {
    this.userAuth.next(auth);
  }

  updateUsername(user: ItokenPayload): Observable<any> {
    return this.http.patch(`/api/username`, user, {});
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
