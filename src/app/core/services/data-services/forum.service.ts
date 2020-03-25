import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

import { CommonDataService } from './common-data.service';
import { SharedComponent } from '@shared/shared.component';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  private dataSvcURL = this.commonData.getLocation();

  constructor(private commonData: CommonDataService,
              private shared: SharedComponent,
              private http: HttpClient) { }

  getGroup(names: string, values: string): Observable<any> {
    let kNames = names.split('|');
    let kValues = values.split('|');

    let keyValues = '{"' + kNames[0] + '":"' + kValues[0] + '"';
    for (let i=1; i < kNames.length; i++) {
      keyValues = keyValues + ',"' + kNames[i] + '":"' + kValues[i] + '"';
    }
    keyValues = keyValues + '}';

    let param = JSON.parse(keyValues);
    console.log('KEY VALUES=', keyValues);

    return this.http.get(`${this.dataSvcURL}/forum-group`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: param
    });
  }

  getGroups(groups: Array<string>): Observable<any> {
    return this.http.get(`${this.dataSvcURL}/forum-group`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: { "groups": groups }
    });
  }

  addGroup(names: string, values: string): Observable<any> {
    let kNames = names.split('|');
    let kValues = values.split('|');

    let keyValues = '{"' + kNames[0] + '":"' + kValues[0] + '"';
    for (let i=1; i < kNames.length; i++) {
      keyValues = keyValues + ',"' + kNames[i] + '":"' + kValues[i] + '"';
    }
    keyValues = keyValues + '}';
    keyValues = JSON.parse(keyValues);
    console.log('KEY VALUES ADD=', keyValues);

    return this.http.post(`${this.dataSvcURL}/forum-group`, keyValues,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  getPosts(forumID: string): Observable<any> {
    return this.http.get(`${this.dataSvcURL}/forum-posts`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: { "forumID": forumID }
    });
  }
}
