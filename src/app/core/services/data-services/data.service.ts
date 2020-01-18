import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CommonDataService } from './common-data.service';
import { ItokenPayload } from '../../../interfaces/tokenPayload';
import { ItokenResponse } from '../../../interfaces/tokenResponse';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private token: string;

  constructor(private commonData: CommonDataService,
              private http: HttpClient) { }

  public getUserProfile(): Observable<any> {
    return this.dataRequest('get', 'profile');
  }

  private dataRequest(method: 'post'|'get',
                      type: 'profile',
                      user?: ItokenPayload): Observable<any> {

    const dataSvcURL = this.commonData.getLocation();

    if (method === 'post') {
      return this.http.post(`${dataSvcURL}/${type}`, user);
    } else {
      return this.http.get(`${dataSvcURL}/${type}`,
            { headers: { Authorization: `Bearer ${this.getToken()}` }});
    }
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('rvlikeme-token');
    }
    return this.token;
  }

  private saveToken(token: string): void {
    localStorage.setItem('rvlikeme-token', token);
    this.token = token;
  }

  /*   deleteUser(userId: string) {
    const dataSvcURL = this.getLocation();
    this.http.delete(dataSvcURL + userId)
    .subscribe(() => {
        console.log('deleted');
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    });
  } */
}