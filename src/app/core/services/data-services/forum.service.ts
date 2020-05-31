import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface Iposts {
  _id: string,
  createdBy: string,
  body: string,
  displayName: string,
  profileImageUrl: string,
  postPhotoUrl: string,
  link: string,
  linkDesc: string,
  linkTitle: string,
  linkImage: string,
  commentCount: number,
  reactionCount: number,
  createdAt: Date,
  fragment?: string
}

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

  addComment(postID: string, displayName: string, profileImageUrl: string, comment: string): Observable<any> {
    let commentEscaped = this.escapeJsonReservedCharacters(comment);
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"comment":"' + commentEscaped + '"}'
    let bodyJSON = JSON.parse(body);

    return this.http.post(`/api/forum-post-comment`, bodyJSON, {});
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
    return this.http.post(`/api/forum-group`, keyValues, {});
  }

  addGroupTopic(topicID: string, topicDesc: string): Observable<any> {
    let keyValues = '{"topicID":"' + topicID + '","topicDesc":"' + topicDesc + '"}';

    return this.http.post(`/api/forum-topic`, JSON.parse(keyValues), {});
  }

  addPost(groupID: string, post:string, displayName: string, profileImageUrl: string,
          postPhotoUrl: string, link: string, linkDesc: string, linkTitle: string, linkImage: string,
          yearOfBirth: number, rigLength: number): Observable<any> {

    let postEscaped: string;

    if (post) {
      postEscaped = this.escapeJsonReservedCharacters(post);
    } else {
      postEscaped = '';
    }

    let body = '{"groupID":"' + groupID +
                '","body":"' + postEscaped +
                '","displayName":"' + displayName +
                '","profileImageUrl":"' + profileImageUrl +
                '","postPhotoUrl":"' + postPhotoUrl +
                '","link":"' + link +
                '","linkDesc":"' + linkDesc +
                '","linkTitle":"' + linkTitle +
                '","linkImage":"' + linkImage +
                '","yearOfBirth":"' + yearOfBirth +
                '","rigLength":"' + rigLength +
                '"}'

    let bodyJSON = JSON.parse(body);
    return this.http.post(`/api/forum-post`, bodyJSON, {});
  }

  addReaction(postID: string, displayName: string, profileImageUrl: string, reaction: string): Observable<any> {
    let body = '{"postID":"' + postID + '",' +
                '"displayName":"' + displayName + '",' +
                '"profileImageUrl":"' + profileImageUrl + '",' +
                '"reaction":"' + reaction + '"}'
    let bodyJSON = JSON.parse(body);

    return this.http.post(`/api/forum-post-reaction`, bodyJSON, {});
  }

  deletePost(postID: string): Observable<any> {
    let post = '{"postID":"' + postID + '"}';

    return this.http.put(`/api/post-delete`, JSON.parse(post), {});
  }


  deletePostImage(imageUrl: string): Observable<any> {
    let image = '{"imageUrl":"' + imageUrl + '"}';
    let imageUrlJSON = JSON.parse(image);

    return this.http.put(`/api/post-delete-image`, imageUrlJSON, {});
  }

  getGroup(names: string, values: string): Observable<any> {
    let kNames = names.split('|');
    let kValues = values.split('|');
    let keyValues = '';

    if (kNames[0] === 'yearOfBirth' || kNames[0] === 'rigLength') {
      keyValues = '{"' + kNames[0] + '":0';
    } else {
      keyValues = '{"' + kNames[0] + '":"' + kValues[0] + '"';
    }

    for (let i=1; i < kNames.length; i++) {
      if (kNames[i] === 'yearOfBirth' || kNames[i] === 'rigLength') {
        keyValues = keyValues + ',"' + kNames[i] + '":0';
      } else {
        keyValues = keyValues + ',"' + kNames[i] + '":"' + kValues[i] + '"';
      }
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

  getPosts(groupID: string, yearOfBirth?: number, rigLength?: number): Observable<any> {
    let params = '{"groupID":"' + groupID + '"';
    if (yearOfBirth) {
      params = params + ',"yearOfBirth":' + yearOfBirth;
    }

    if (rigLength) {
      params = params + ',"rigLength":' + rigLength;
    }

    params = params + '}';

    return this.http.get(`/api/forum-posts`, { params: JSON.parse(params) });
  }

  updatePost(postID: string, post:string, postPhotoUrl: string,
              link: string, linkDesc: string, linkTitle: string, linkImage: string): Observable<any> { //TODO: update doesn't work with escaped characters. It updates with those characters.
    let postEscaped = this.escapeJsonReservedCharacters(post);
    let body = '{"postID":"' + postID +
                '","body":"' + postEscaped +
                '","postPhotoUrl":"' + postPhotoUrl +
                '","link":"' + link +
                '","linkDesc":"' + linkDesc +
                '","linkTitle":"' + linkTitle +
                '","linkImage":"' + linkImage +
                '"}'
    let bodyJSON = JSON.parse(body);

    return this.http.put(`/api/forum-post`, bodyJSON, {});
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }

}
