import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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

@Injectable()
export class ForumService {

  constructor(private http: HttpClient) { }

  addComment(postID: string, displayName: string, profileImageUrl: string, comment: string): Observable<any> {
    let params = {
      postID: postID,
      displayName: displayName,
      profileImageUrl: profileImageUrl,
      comment: comment
    }

    return this.http.post(`/api/forum-post-comment`, params, {});
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
    let params = {
      topicID: topicID,
      topicDesc: topicDesc
    }

    return this.http.post(`/api/forum-topic`, params, {});
  }

  addPost(groupID: string, post:string, displayName: string, profileImageUrl: string,
          postPhotoUrl: string, link: string, linkDesc: string, linkTitle: string, linkImage: string,
          yearOfBirth: number, rigLength: number): Observable<any> {

    let params = {
      groupID: groupID,
      body: post,
      displayName: displayName,
      profileImageUrl: profileImageUrl,
      postPhotoUrl: postPhotoUrl,
      link: link,
      linkDesc: linkDesc,
      linkTitle: linkTitle,
      linkImage: linkImage,
      yearOfBirth: yearOfBirth,
      rigLength: rigLength
    }

    return this.http.post(`/api/forum-post`, params, {});
  }

  addReaction(postID: string, displayName: string, profileImageUrl: string, reaction: string): Observable<any> {
    let params = {
      postID: postID,
      displayName: displayName,
      profileImageUrl: profileImageUrl,
      reaction: reaction
    }

    return this.http.post(`/api/forum-post-reaction`, params, {});
  }

  deletePost(postID: string): Observable<any> {
    let params = {
      postID: postID
    }

    return this.http.put(`/api/post-delete`, params, {});
  }


  deletePostImage(imageUrl: string): Observable<any> {
    let params = {
      imageUrl: imageUrl
    }

    return this.http.put(`/api/post-delete-image`, params, {});
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
    let params = new HttpParams().set('groupID', groupID);

    return this.http.get(`/api/forum-group-id`, { params: params });
  }

  getGroupByTopic(topic: string): Observable<any> {
    let params = new HttpParams().set('topic', topic);

    return this.http.get(`/api/forum-group-topic`, { params: params });
  }

  getPosts(groupID: string, yearOfBirth?: string, rigLength?: string): Observable<any> {
    let params = new HttpParams().set('groupID', groupID)
                                  .set('yearOfBirth', yearOfBirth)
                                  .set('rigLength', rigLength)

    return this.http.get(`/api/forum-posts`, { params: params });
  }

  updatePost(postID: string, post:string, postPhotoUrl: string,
              link: string, linkDesc: string, linkTitle: string, linkImage: string): Observable<any> { //TODO: update doesn't work with escaped characters. It updates with those characters.

    let params = {
      postID: postID,
      body: post,
      postPhotoUrl: postPhotoUrl,
      link: link,
      linkDesc: linkDesc,
      linkTitle: linkTitle,
      linkImage: linkImage
    }

    return this.http.put(`/api/forum-post`, params, {});
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }

}
