import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';

export interface Imessage {
  _id: string;
  createdBy: string;
  createdByDisplayName: string;
  createdByProfileImageUrl: string;
  withUserID: string;
  withUserDisplayName: string;
  withUserProfileImageUrl: string;
  message: string;
  createdAt: Date;
}

export interface Iconversation {
  _id: string;
  createdBy: string;
  createdByDisplayName: string;
  createdByProfileImageUrl: string;
  createdByUnreadMessages: Boolean;
  withUserID: string;
  withUserDisplayName: string;
  withUserProfileImageUrl: string;
  withUserUnreadMessages: boolean;
  messages: Array<Imessage>;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) { }

  getConversations(): Observable<any> {
    return this.http.get(`/api/conversations`);
  }

  getConversation(fromUserID: string, toUserID: string): Observable<any> {
    let param = JSON.parse('{"fromUserID":"' + fromUserID + '","toUserID":"' + toUserID + '"}');
    console.log('MessagesService:getConversation: param=', param);

    return this.http.get(`/api/conversation`, { params: param  });
  }

  updateMessagesRead(messagesRead) {
    console.log('MessagesService:updateMessagesRead: array=', messagesRead);
    return this.http.put(`/api/messages-update`, messagesRead,{});
  }

  sendMessage(conversationID: string, fromUserID: string, fromDisplayName: string, fromProfileImageUrl: string,
              toUserID: string, toDisplayName: string, toProfileImageUrl: string, message): Observable<any> {
    let messageEscaped = this.escapeJsonReservedCharacters(message);
    let body = '{"conversationID":"' + conversationID + '",' +
                '"fromUserID":"' + fromUserID + '",' +
                '"fromDisplayName":"' + fromDisplayName + '",' +
                '"fromProfileImageUrl":"' + fromProfileImageUrl + '",' +
                '"toUserID":"' + toUserID + '",' +
                '"toDisplayName":"' + toDisplayName + '",' +
                '"toProfileImageUrl":"' + toProfileImageUrl + '",' +
                '"message":"' + messageEscaped + '"}'
    console.log('MessagesService:sendMessage: body=', body)
    let bodyJSON = JSON.parse(body);
    console.log('MessagesService:sendMessage: bodyJson=', bodyJSON);
    return this.http.post(`/api/message-send`, bodyJSON, {});
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
