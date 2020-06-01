import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProfileService } from '@services/data-services/profile.service';

import { SentryMonitorService } from './../sentry-monitor.service';
import { ShareDataService } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

export interface ItokenPayload {
  _id: string;
  email: string;
  password: string;
  active: boolean;
  nbrLogins: number;
  admin: boolean;
  emailNotVerified: boolean;
  tokenExpire: number;
}

export interface ItokenResponse {
  token: string;
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
              private activateBackArrowSvc: ActivateBackArrowService,
              private shareDataSvc: ShareDataService,
              private sentryMonitorSvc: SentryMonitorService) { }


  activateUser(token: string): Observable<any> {
    let params = {
      token: token
    }

    return this.http.put(`/api/activate`, params, {});
  }

  changePassword(user: any): Observable<any> {
    return this.http.post(`/api/change-password`, user, {});
  }

  changeUsername(user: any): Observable<any> {
    return this.http.put(`/api/username`, user, {});
  }

  getPasswordResetToken(email: string, noExpire: boolean, type: string): Observable<any> {
    let noExpireText: string = 'false';
    if (noExpire) {
      noExpireText = 'true';
    }

    let params = {
      email: email,
      noExpire: noExpire,
      type: type
    }

    return this.http.post(`/api/get-password-reset-token`, params, {});
  }

  getDaveInfo(): Observable<any> {
    return this.http.get(`/api/dave`);
  }

  getOtherUserEmail(userID: string): Observable<any> {
    let params = new HttpParams().set('userID', userID)

    return this.http.get(`/api/other-email`, { params: params });
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
    this.profileSvc.getProfile(true); // reset profile behavior subject
    this.activateBackArrowSvc.setBackRoute('', 'nostack');
    this.shareDataSvc.clearAllData();
  }

  registerUser(user: ItokenPayload, firstName: string): Observable<any> {
    let base;
    let params = {
      credentials: user,
      firstName: firstName
    }
    console.log('register user = ', params)
    base = this.http.post(`/api/register`, params);
    const request = base.pipe(
      map((data: ItokenResponse) => { // Saving token here, but may be better to save on register confirm.  However, would have to make sure the email confirm is on
        if (data.token) {
          this.saveToken(data.token);
        }
        this.sentryMonitorSvc.monitorUser(user);
        return data;
      })
    );
    return request;
  }

  resetPassword(token: string, tokenID: string, password: string): Observable<any> {
    let params = {
      token: token,
      tokenID: tokenID,
      password: password
    }

    return this.http.post(`/api/password-reset`, params, {});
  }

  setUserToAuthorized(auth: boolean): void {
    this.userAuth.next(auth);
  }

  setUserToAdmin(admin): void {
    this._userAdmin.next(admin);
  }

  updateInstallFlag(install: boolean, device: string): Observable<any> {
    let params = {
      install: install,
      device: device
    }

    return this.http.put(`/api/install-flag`, params, {});
  }

  updateLoginCount(): Observable<any> {
    return this.http.put(`/api/login-count`, {});
  }

  validatePasswordResetToken(token: string): Observable<any> {
    let params = {
      token: token
    }

    return this.http.post(`/api/validate-password-reset-token`, params, {});
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('rvlikeme-token');
    }
    return this.token;
  }

  // Get user token from local storage
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

  // Save token in local storage
  private saveToken(token: string): void {
    localStorage.setItem('rvlikeme-token', token);
    this.token = token;
  }
}
