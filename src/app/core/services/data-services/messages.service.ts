import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) { }

  getMessages(): Observable<any> {
    return this.http.get(`/api/messages`);
  }

  getMessagesByUserID(fromUserID: string, toUserID: string, toDisplayName: string, toProfileImageUrl: string): Observable<any> {
    let param = JSON.parse('{"fromUserID":"' + fromUserID + '","toUserID":"' + toUserID + '"}');
    console.log('Messages:getMessagesByUserID: param=', param);
    console.log('MessagesService:getMessagesByUserID: param =', param);

    return this.http.get(`/api/messages-by-userid`, { params: param  });
  }

  sendMessage(fromUserID: string, fromDisplayName: string, fromProfileImageUrl: string,
              toUserID: string, toDisplayName: string, toProfileImageUrl: string, message): Observable<any> {
    let messageEscaped = this.escapeJsonReservedCharacters(message);
    let body = '{"fromUserID":"' + fromUserID + '",' +
                '"fromDisplayName":"' + fromDisplayName + '",' +
                '"fromProfileImageUrl":"' + fromProfileImageUrl + '",' +
                '"toUserID":"' + toUserID + '",' +
                '"toDisplayName":"' + toDisplayName + '",' +
                '"toProfileImageUrl":"' + toProfileImageUrl + '",' +
                '"message":"' + messageEscaped + '"}'
    console.log('MESSAGE BODY=', body)
    let bodyJSON = JSON.parse(body);
    console.log('COMMENT BODYJSON=', bodyJSON);
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
