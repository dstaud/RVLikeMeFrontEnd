import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { UUID } from 'angular2-uuid';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProfileService } from '@services/data-services/profile.service';

import { SentryMonitorService } from './../sentry-monitor.service';
import { AdminService } from '@services/data-services/admin.service';

export interface ItokenPayload {
  _id: string;
  email: string;
  password: string;
  activateID: UUID;
  active: boolean;
  nbrLogins: number;
  admin: boolean;
  tokenExpire: number;
}

export interface ItokenResponse {
  token: string;
  activateID: UUID;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token: string;

  private userAuth = new Subject<boolean>();
  userAuth$ = this.userAuth.asObservable();

  private _userAdmin = new BehaviorSubject<boolean>(false);
  userAdmin = this._userAdmin.asObservable();

  constructor(private http: HttpClient,
              private profileSvc: ProfileService,
              private adminSvc: AdminService,
              private sentryMonitorSvc: SentryMonitorService) { }


  activateUser(activationID: string): Observable<any> {
    let params = '{"activateID":"' + activationID + '"}';

    console.log('AuthenticationService:activateUser: params=', params);
    return this.http.put(`/api/activate`, params, {});
  }

  getUser(): Observable<any> {
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
          console.log('AuthenticationService:login: TOKEN=', data.token);
        }
        this.sentryMonitorSvc.monitorUser(user);
        return data;
      })
    );
    return request;
  }

  logout(): void {
    this.token = '';
    this.setUserToAdmin(false);
    window.localStorage.removeItem('rvlikeme-token');
    this.profileSvc.getProfile(true);
  }

  registerUser(user: ItokenPayload): Observable<any> {
    let base;

    user.activateID = this.generateUUID();

    console.log('AuthenticationService:registerUser: user=', user);
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

  setUserToAdmin(admin): void {
    this._userAdmin.next(admin);
  }

  updateLoginCount(): Observable<any> {
    return this.http.put(`/api/login-count`, {});
  }

  updateUsername(user: ItokenPayload): Observable<any> {
    return this.http.put(`/api/username`, user, {});
  }

  confirmRegistration(regCode: string): Observable<any> {
    let param = JSON.parse('{"regCode":"' + regCode + '"}');
    return this.http.get(`/api/confirm-reg`, { params: param });
  }

  private generateUUID(): UUID{
    let uuidValue = UUID.UUID();
    return uuidValue;
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
