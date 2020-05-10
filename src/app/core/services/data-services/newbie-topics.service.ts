import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

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
  linkName: string;
  link: string;
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

  getNewbieTopics(): Observable<any> {
    return this.http.get(`/api/newbie-topics`);
  }

  addNewbieTopic(topicID: string, topicDesc: string, displayName: string, profileImageUrl: string): Observable<any> {
    let keyValues = '{"topicID":"' + topicID + '",' +
                    '"topicDesc":"' + topicDesc + '",' +
                    '"displayName":"' + displayName + '",' +
                    '"profileImageUrl":"' + profileImageUrl + '"}'

    return this.http.post(`/api/newbie-topic`, JSON.parse(keyValues), {});
  }

  addNewbieSuggestTopic(topic: string, displayName: string, profileImageUrl: string): Observable<any> {
    let escapedTopic = this.escapeJsonReservedCharacters(topic);

    let keyValues = '{"topic":"' + escapedTopic + '",' +
                    '"displayName":"' + displayName + '",' +
                    '"profileImageUrl":"' + profileImageUrl + '"}'

    return this.http.post(`/api/newbie-suggest-topic`, JSON.parse(keyValues), {});
  }

  addNewbieTopicPost(topicID: string, displayName: string, profileImageUrl: string, post: string, photoUrl: string): Observable<any> {
    let postEscaped = this.escapeJsonReservedCharacters(post);

    let keyValues = '{"topicID":"' + topicID + '",' +
                    '"displayName":"' + displayName + '",' +
                    '"profileImageUrl":"' + profileImageUrl + '",' +
                    '"photoUrl":"' + photoUrl + '",' +
                    '"body":"' + postEscaped + '"}'

    return this.http.post(`/api/newbie-topic-post`, JSON.parse(keyValues), {});
  }

  getNewbieLinks(topicID: string): Observable<any> {
    let param = JSON.parse('{"topicID":"' + topicID + '"}');
    console.log('NewbieTopicsService:getNewbieLinks: param=', param);
    return this.http.get(`/api/newbie-links`, { params: param  });
  }

  addNewbieLink(topicID: string, linkName: string, link: string, displayName: string, profileImageUrl: string): Observable<any> {
    let keyValues = '{"topicID":"' + topicID + '",' +
                    '"linkName":"' + linkName + '",' +
                    '"link":"' + link + '",' +
                    '"displayName":"' + displayName + '",' +
                    '"profileImageUrl":"' + profileImageUrl + '"}'

    return this.http.post(`/api/newbie-link`, JSON.parse(keyValues), {});
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }
}
