import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface Icomments {
  comment: string,
  displayName: string,
  profileImageUrl: string,
  createdAt: Date,
  createdBy: string
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  // TODO: Add interface for groups and posts

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

    return this.http.get(`/api/forum-group`, { params: param });
  }

  getGroupByID(groupID: string): Observable<any> {
    let param = JSON.parse('{"groupID":"' + groupID + '"}');

    return this.http.get(`/api/forum-group-id`, { params: param });
  }

  getGroupByTopic(topic: string): Observable<any> {
    let param = JSON.parse('{"topic":"' + topic + '"}');

    return this.http.get(`/api/forum-group-topic`, { params: param });
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
    console.log('ForumService:addGroup: keyvalues=', keyValues);
    return this.http.post(`/api/forum-group`, keyValues, {});
  }

  addGroupTopic(topic: string, topicDesc: string): Observable<any> {
    let keyValues = '{"topic":"' + topic + '","topicDesc":"' + topicDesc + '"}';

    return this.http.post(`/api/forum-topic`, JSON.parse(keyValues), {});
  }

  addPost(groupID: string, post:string, displayName: string, profileImageUrl: string, postPhotoUrl: string): Observable<any> {
    // let titleEscaped = this.escapeJsonReservedCharacters(title);
    let postEscaped = this.escapeJsonReservedCharacters(post);
    let body = '{"groupID":"' + groupID +
                // '","title":"' + titleEscaped +
                '","body":"' + postEscaped +
                '","displayName":"' + displayName +
                '","profileImageUrl":"' + profileImageUrl +
                '","postPhotoUrl":"' + postPhotoUrl +
                '"}'
    let bodyJSON = JSON.parse(body);
    return this.http.post(`/api/forum-post`, bodyJSON, {});
  }

  getPosts(groupID: string): Observable<any> {
    return this.http.get(`/api/forum-posts`, { params: { "groupID": groupID }});
  }

  updatePost(postID: string, post:string): Observable<any> { //TODO: update doesn't work with escaped characters. It updates with those characters.
    // let titleEscaped = this.escapeJsonReservedCharacters(title);
    let postEscaped = this.escapeJsonReservedCharacters(post);
    let body = '{"postID":"' + postID +
                // '","title":"' + titleEscaped +
                '","body":"' + postEscaped +
                '"}'
    let bodyJSON = JSON.parse(body);
    return this.http.put(`/api/forum-post`, bodyJSON, {});
  }

  addComment(postID: string, displayName: string, profileImageUrl: string, comment: string): Observable<any> {
    let commentEscaped = this.escapeJsonReservedCharacters(comment);
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"comment":"' + commentEscaped + '"}'
    let bodyJSON = JSON.parse(body);
    return this.http.post(`/api/forum-post-comment`, bodyJSON, {});
  }

  addReaction(postID: string, displayName: string, profileImageUrl: string, reaction: string): Observable<any> {
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"reaction":"' + reaction + '"}'
    let bodyJSON = JSON.parse(body);
    return this.http.post(`/api/forum-post-reaction`, bodyJSON, {});
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }

}
