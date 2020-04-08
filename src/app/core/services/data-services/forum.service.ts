import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForumService {


  constructor(private http: HttpClient) { }

  getGroup(names: string, values: string): Observable<any> {
    let kNames = names.split('|');
    let kValues = values.split('|');

    let keyValues = '{"' + kNames[0] + '":"' + kValues[0] + '"';
    for (let i=1; i < kNames.length; i++) {
      keyValues = keyValues + ',"' + kNames[i] + '":"' + kValues[i] + '"';
    }
    keyValues = keyValues + '}';

    let param = JSON.parse(keyValues);
    console.log('ForumService:getGroup: Key values=', keyValues);

    return this.http.get(`/api/forum-group`, { params: param });
  }

  getGroupByID(groupID: string): Observable<any> {
    let param = JSON.parse('{"groupID":"' + groupID + '"}');

    console.log('ForumService:getGroup: param =', param);

    return this.http.get(`/api/forum-group-id`, { params: param });
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

    return this.http.post(`/api/forum-group`, keyValues, {});
  }

  getPosts(groupID: string): Observable<any> {
    return this.http.get(`/api/forum-posts`, { params: { "groupID": groupID }});
  }

  addPost(groupID: string, post:string, displayName: string, profileImageUrl: string): Observable<any> {
    // let titleEscaped = this.escapeJsonReservedCharacters(title);
    let postEscaped = this.escapeJsonReservedCharacters(post);
    let body = '{"groupID":"' + groupID +
                // '","title":"' + titleEscaped +
                '","body":"' + postEscaped +
                '","displayName":"' + displayName +
                '","profileImageUrl":"' + profileImageUrl +
                '"}'
    console.log('BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('BODYJSON=', body);
    return this.http.post(`/api/forum-post`, bodyJSON, {});
  }

  updatePost(postID: string, post:string): Observable<any> { //TODO: update doesn't work with escaped characters. It updates with those characters.
    // let titleEscaped = this.escapeJsonReservedCharacters(title);
    let postEscaped = this.escapeJsonReservedCharacters(post);
    let body = '{"postID":"' + postID +
                // '","title":"' + titleEscaped +
                '","body":"' + postEscaped +
                '"}'
    console.log('BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('BODYJSON=', body);
    return this.http.put(`/api/forum-post`, bodyJSON, {});
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
    return this.http.post(`/api/forum-post-comment`, bodyJSON, {});
  }

  addReaction(postID: string, displayName: string, profileImageUrl: string, reaction: string): Observable<any> {
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"reaction":"' + reaction + '"}'
    console.log('REACTION BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('REACTION BODYJSON=', bodyJSON);
    return this.http.post(`/api/forum-post-reaction`, bodyJSON, {});
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
