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

/*   getGroups(groups: Array<string>): Observable<any> {
    return this.http.get(`${this.dataSvcURL}/forum-groups`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: { "groups": groups }
    });
  } */

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

  getPosts(groupID: string): Observable<any> {
    return this.http.get(`${this.dataSvcURL}/forum-posts`,
    {
      headers: { Authorization: `Bearer ${this.commonData.getToken()}` },
      params: { "groupID": groupID }
    });
  }

  addPost(groupID: string, title: string, post:string, displayName: string, profileImageUrl: string): Observable<any> {
    let titleEscaped = this.escapeJsonReservedCharacters(title);
    let postEscaped = this.escapeJsonReservedCharacters(post);
    let body = '{"groupID":"' + groupID +
                '","title":"' + titleEscaped +
                '","body":"' + postEscaped +
                '","displayName":"' + displayName +
                '","profileImageUrl":"' + profileImageUrl +
                '"}'
    console.log('BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('BODYJSON=', body);
    return this.http.post(`${this.dataSvcURL}/forum-post`, bodyJSON,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  addComment(postID: string, displayName: string, profileImageUrl: string, comment: string): Observable<any> {
    let commentEscaped = this.escapeJsonReservedCharacters(comment);
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"comment":"' + commentEscaped + '"}'
    console.log('COMMENT BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('COMMENT BODYJSON=', bodyJSON);
    return this.http.post(`${this.dataSvcURL}/forum-post-comment`, bodyJSON,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  addReaction(postID: string, displayName: string, profileImageUrl: string, reaction: string): Observable<any> {
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"reaction":"' + reaction + '"}'
    console.log('REACTION BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('REACTION BODYJSON=', bodyJSON);
    return this.http.post(`${this.dataSvcURL}/forum-post-reaction`, bodyJSON,
    { headers: { Authorization: `Bearer ${this.commonData.getToken()}` }});
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    console.log(string, newString);
    return newString;
  }

}
