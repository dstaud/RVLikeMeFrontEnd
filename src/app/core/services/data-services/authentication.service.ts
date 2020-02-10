import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { WindowService } from './../window.service';
import { map } from 'rxjs/operators';
import { Iuser } from '../../../interfaces/user';
import { ItokenPayload } from '../../../interfaces/tokenPayload';
import { ItokenResponse } from '../../../interfaces/tokenResponse';
import { DataService } from './data.service';
import { CommonDataService } from './common-data.service';
import { SentryMonitorService } from './../sentry-monitor.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token: string;
  private userAuth = new Subject<boolean>();
  userAuth$ = this.userAuth.asObservable();
  body: Iuser;

  constructor(private http: HttpClient,
              private dataSvc: DataService,
              private WindowRef: WindowService,
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
    console.log('throwing error', error.status);
    if (error.status === 401) {
      console.log('401');
      return;
    } else {
      // return throwError(errorMessage);
    }
  }

   public isLoggedIn(): boolean {
    const token = this.getLocalToken();
    if (token) {
      console.log('Token Expire ', token.tokenExpire)
      return token.tokenExpire > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public login(user: ItokenPayload): Observable<any> {
    console.log('in login');
    let base;
    const dataSvcURL = this.commonData.getLocation();
    base = this.http.post(`${dataSvcURL}/login`, user);
    const request = base.pipe(
      map((data: ItokenResponse) => {
        console.log('response=', data);
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
  }

  public registerUser(user: ItokenPayload): Observable<any> {
    console.log('registering user=', user);
    let base;
    const dataSvcURL = this.commonData.getLocation();
    base = this.http.post(`${dataSvcURL}/register`, user);
    const request = base.pipe(
      map((data: ItokenResponse) => {
        console.log('response=', data);
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
    console.log('patching with token ', dataSvcURL, user);
    return this.http.patch(`${dataSvcURL}/username`, user,
    { headers: { Authorization: `Bearer ${this.getToken()}` }});
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('rvlikeme-token');
    }
    console.log('token=', this.token);
    return this.token;
  }

  private getLocalToken(): ItokenPayload {
    const token = this.getToken();
    console.log('getLocalToken=', token);
    let payload;
    if (token) {
      payload = token.split('.')[1];
      console.log('payload after split=', payload);
      payload = window.atob(payload);
      console.log('payload after atob=', JSON.parse(payload));
      this.sentryMonitorSvc.monitorUser(JSON.parse(payload));
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  private saveToken(token: string): void {
    console.log('save token=', token);
    localStorage.setItem('rvlikeme-token', token);
    this.token = token;
  }
}
