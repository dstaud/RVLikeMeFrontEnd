import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { retry } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { SharedComponent } from '@shared/shared.component';

export interface Imessage {
  _id: string;
  createdBy: string;
  createdByDisplayName: string;
  createdByProfileImageUrl: string;
  sentToUserID: string;
  sentToDisplayName: string;
  sentToProfileImageUrl: string;
  message: string;
  createdAt: Date;
}

export interface Iconversation {
  _id: string;
  createdBy: string;
  createdByDisplayName: string;
  createdByProfileImageUrl: string;
  createdByUnreadMessages: number;
  withUserID: string;
  withUserDisplayName: string;
  withUserProfileImageUrl: string;
  withUserUnreadMessages: number;
  messages: Array<Imessage>;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private userConversation = [{
    _id: null,
    createdBy: null,
    createdByDisplayName: null,
    createdByProfileImageUrl: null,
    createdByUnreadMessages: 0,
    withUserID: null,
    withUserDisplayName: null,
    withUserProfileImageUrl: null,
    withUserUnreadMessages: 0,
    messages: [],
    updatedAt: null
  }];

  private _conversation = new BehaviorSubject<Iconversation[]>(this.userConversation);
  private dataStore: { conversation: Iconversation[] } = { conversation: this.userConversation }
  conversation$ = this._conversation.asObservable();

  constructor(private http: HttpClient,
              private shared: SharedComponent) { }

  ngOnDestroy() {}

  getConversations() {
    this.http.get<Iconversation[]>(`/api/conversations`)
    .pipe(untilComponentDestroyed(this), retry(3))
    .subscribe(conversationResult => {
      this.dataStore.conversation = conversationResult;
      this._conversation.next(Object.assign({}, this.dataStore).conversation);
    }, (error) => {
      if (error.status === 404) {
      } else {
        this.shared.notifyUserMajorError(error);
        throw new Error(JSON.stringify(error));
      }
    });
  }

  getConversationsNotRead(userIdType: string): Observable<any> {
    let params = new HttpParams().set('userIdType', userIdType);

    return this.http.get<number>(`/api/conversations-not-read`, { params: params  });
  }

  getConversation(fromUserID: string, toUserID: string): Observable<any> {
    let params = new HttpParams().set('fromUserID', fromUserID)
                                  .set('toUserID', toUserID)

    return this.http.get(`/api/conversation`, { params: params  });
  }

  sendMessage(conversationID: string, fromUserID: string, fromDisplayName: string, fromProfileImageUrl: string,
    toUserID: string, toDisplayName: string, toProfileImageUrl: string, message: string): Observable<any> {

    let params = {
    conversationID: conversationID,
    fromUserID: fromUserID,
    fromDisplayName: fromDisplayName,
    fromProfileImageUrl: fromProfileImageUrl,
    toUserID: toUserID,
    toDisplayName: toDisplayName,
    toProfileImageUrl: toProfileImageUrl,
    message: message
    }

    return this.http.post(`/api/message-send`, params, {});
  }

  updateConversation(conversationID: string, userIdType: string, action: string) {
    let params = {
      conversationID: conversationID,
      userIdType: userIdType,
      action: action
    }
    console.log('update conversation=', params);
    return this.http.put(`/api/conversation-update`, params,{});
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }

}
