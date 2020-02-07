import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { throwError, Observable, Subject } from 'rxjs';
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
      return this.dataRequest('get', 'username');
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
    return this.dataRequest('post', 'login', user);
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('rvlikeme-token');
  }

  public registerUser(user: ItokenPayload): Observable<any> {
    console.log('calling register on')
    return this.dataRequest('post', 'register', user);
  }

  public setUserToAuthorized(auth: boolean): void {
    this.userAuth.next(auth);
  }

  public updateUsername(user: ItokenPayload): Observable<any> {
    console.log('in update username', user);
    return this.dataRequest('post', 'username', user);
  }

  private dataRequest(method: 'post'|'get'|'patch',
                      type: 'login'|'register'|'username',
                      user?: ItokenPayload): Observable<any> {
    let base;
    const dataSvcURL = this.commonData.getLocation();
    console.log('getting data service', dataSvcURL, type, user);

    if (type === 'username') {
      if (method === 'get') {
        return this.http.get(`${dataSvcURL}/${type}`,
        { headers: { Authorization: `Bearer ${this.getToken()}` }});
      } else {
        console.log('patching with token ', dataSvcURL, type, user);
        return this.http.patch(`${dataSvcURL}/${type}`, user,
        { headers: { Authorization: `Bearer ${this.getToken()}` }});
      }
    }

    base = this.http.post(`${dataSvcURL}/${type}`, user);
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

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('rvlikeme-token');
    }
    console.log('token=', this.token);
    return this.token;
  }

  private getLocalToken(): ItokenPayload {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      console.log('in getUserDetails ', JSON.parse(payload));
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
