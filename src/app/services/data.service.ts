import { Iuser } from './../interfaces/user';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { throwError} from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  body: Iuser;

  constructor(private http: HttpClient, private WindowRef: WindowService) { }

  getLocation() {
    // Get back-end URL
    const hostLocation = this.WindowRef.nativeWindow.location.host;
    let dataSvcURL = environment.dataServiceURL + 'api/posts';

    console.log('Host location ', hostLocation);

    if (environment.production && hostLocation.includes('localhost')) {
      // Override back-end URL with localhost if testing Service Worker with production /dist files
      dataSvcURL = 'http://localhost:3000/' + 'api/posts';
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

  registerUser(displayName, firstName, lastName, email, cell, dateOfBirth) {
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
  }

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
