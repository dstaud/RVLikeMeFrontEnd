import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) { }

  getMessagesByID(messageID: string): Observable<any> {
    let param = JSON.parse('{"messageID":"' + messageID + '"}');

    console.log('MessagesService:getMessagesByUserID: param =', param);

    return this.http.get(`/api/messages-by-id`, { params: param  });
  }

  getMessagesByUserID(fromUserID: string, toUserID: string, toDisplayName: string, toProfileImageUrl: string): Observable<any> {
    let param = JSON.parse('{"fromUserID":"' + fromUserID + '","toUserID":"' + toUserID + '"}');
    console.log('Messages:getMessagesByUserID: param=', param);
    console.log('MessagesService:getMessagesByUserID: param =', param);

    return this.http.get(`/api/messages-by-userid`, { params: param  });
  }

}
