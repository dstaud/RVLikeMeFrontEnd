import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WindowService } from './window.service';
import { Iuser } from '../../interfaces/user';
import { ItokenPayload } from '../../interfaces/tokenPayload';
import { ItokenResponse } from '../../interfaces/tokenResponse';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  body: Iuser;
  private token: string;

  constructor(private http: HttpClient, private WindowRef: WindowService) { }

  getLocation() {
    // Get back-end URL
    const hostLocation = this.WindowRef.nativeWindow.location.host;
    // let dataSvcURL = environment.dataServiceURL + 'api/posts';
    let dataSvcURL = environment.dataServiceURL + 'api';

    console.log('Host location ', hostLocation);

    if (environment.production && hostLocation.includes('localhost')) {
      // Override back-end URL with localhost if testing Service Worker with production /dist files
      // dataSvcURL = 'http://localhost:3000/' + 'api/posts';
      dataSvcURL = 'http://localhost:3000/' + 'api';
    }

    console.log('Back-end location ', dataSvcURL);
    return dataSvcURL;
  }

  getUser() {
    const dataSvcURL = this.getLocation();

    return this.http
      .get<{ message: string; users: any }>(dataSvcURL)
      .pipe(map((userData) => {
        return userData.users.map(user => {
          return {
            id: user._id,
            displayName: user.displayName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            cell: user.cell,
            dateOfBirth: user.dateOfBirth
          };
        });
      }));
  }

  private request(method: 'post'|'get',
                  type: 'login'|'register'|'profile',
                  user?: ItokenPayload): Observable<any> {
    let base;
    const dataSvcURL = this.getLocation();
    console.log('Get TOKEN=', this.getToken());
    if (method === 'post') {
      base = this.http.post(`${dataSvcURL}/${type}`, user);
    } else {
      base = this.http.get(`${dataSvcURL}/${type}`,
        { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }

    const request = base.pipe(
      map((data: ItokenResponse) => {
        if (data.token) {
          console.log('received token=', data.token);
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  public registerUser(user: ItokenPayload): Observable<any> {
    return this.request('post', 'register', user);
  }

  public login(user: ItokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }

  public getUserProfile(): Observable<any> {
    return this.request('get', 'profile');
  }

/*   registerUser(firstName: string, email: string, password: string) {
    const dataSvcURL = this.getLocation() + '/register';
    console.log('URL', dataSvcURL);
    let body: any;
    body = {
      firstName: firstName,
      email: email,
      password: password
    };
    console.log('registering user');
    return this.http.post<{message: string}>(dataSvcURL, body);
  } */

  private saveToken(token: string): void {
    localStorage.setItem('rvlikeme-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('rvlikeme-token');
    }
    return this.token;
  }

  signinUser(email: string, password: string) {
    const dataSvcURL = this.getLocation();
    let body: any;
    body = {
      email: email,
      password: password
    };
    console.log('signing in user');
    return this.http.post<{message: string}>(dataSvcURL, body);
  }

/*   registerUser(displayName, firstName, lastName, email, cell, dateOfBirth) {
    const dataSvcURL = this.getLocation();
    this.body = {
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      cell: cell,
      dateOfBirth: dateOfBirth
    };
    console.log('registering user');
    return this.http.post<{message: string}>(dataSvcURL, this.body);
  } */

  deleteUser(userId: string) {
    const dataSvcURL = this.getLocation();
    this.http.delete(dataSvcURL + userId)
    .subscribe(() => {
        console.log('deleted');
/*       const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]); */
    });
  }
  private handleError(err: HttpErrorResponse) {
    console.log('Error Status: ' + err.status + ', Error Message: ' + err.message);
    return throwError(err.message);
  }
}
