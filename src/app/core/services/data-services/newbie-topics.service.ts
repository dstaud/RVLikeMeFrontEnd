import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface InewbieTopics {
  _id: string;
  createdBy: string;
  userDisplayName: string;
  userProfileImageUrl: string;
  photoUrl: string;
  createdAt: Date;
}

export interface InewbieLinks {
  _id: string;
  topicID: string;
  linkDesc: string;
  link: string;
  linkImage: string;
  linkTitle: string;
  createdBy: string;
  createdByDisplayName: string;
  createdByProfileImageUrl: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NewbieTopicsService {

  constructor(private http: HttpClient) { }

  addNewbieTopic(topicID: string, topicDesc: string, displayName: string, profileImageUrl: string): Observable<any> {
    let params = {
      topicID: topicID,
      topicDesc: topicDesc,
      displayName: displayName,
      profileImageUrl: profileImageUrl
    }

    return this.http.post(`/api/newbie-topic`, params, {});
  }

  addNewbieLink(topicID: string, linkTitle: string, link: string, linkDesc: string,
                linkImage: string, displayName: string, profileImageUrl: string): Observable<any> {

    let params = {
      topicID: topicID,
      linkTitle: linkTitle,
      link: link,
      linkDesc: linkDesc,
      linkImage: linkImage,
      displayName: displayName,
      profileImageUrl: profileImageUrl
    }

    return this.http.post(`/api/newbie-link`, params, {});
  }

  getNewbieLinks(topicID: string): Observable<any> {
    let params = new HttpParams().set('topicID', topicID);

    return this.http.get(`/api/newbie-links`, { params: params  });
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }

  getNewbieTopics(): Observable<any> {
    return this.http.get(`/api/newbie-topics`);
  }
}
