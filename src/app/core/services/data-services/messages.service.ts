import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private http: HttpClient) { }

  getMessagesByUserID(userID: string, sendToUserID: string): Observable<any> {
    let param = JSON.parse('{"userID":"' + userID + '","sendToUserID":"' + sendToUserID + '"}');

    console.log('MessagesService:getMessagesByUserID: param =', param);

    return this.http.get(`/api/messages-by-id`, { params: param  });
  }
}
