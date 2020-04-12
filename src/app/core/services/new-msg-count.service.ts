import { Injectable, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { Iconversation } from '@services/data-services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class NewMessageCountService {
  private _newMessageCount = new Subject<number>();
  newMessageCount$ = this._newMessageCount.asObservable();

  constructor() { }

  ngOnDestroy() {}

  public getNewMessageCount(userID: string, conversations: Iconversation[]): void {
    let count: number = 0;

    console.log('NewMsgCountService:getNewMessageCount: getting new message count');

    for (let i=0; i < conversations.length; i++) {
      if (conversations[i].createdBy === userID) {
        count = count + conversations[i].createdByUnreadMessages;
        console.log('NewMsgCountService:getNewMessageCount: createdBy count=', conversations[i].createdByUnreadMessages, count);
      }
      if (conversations[i].withUserID === userID) {
        count = count + conversations[i].withUserUnreadMessages;
        console.log('NewMsgCountService:getNewMessageCount: withUser count=', conversations[i].withUserUnreadMessages, count);
      }
    }
    console.log('NewMsgCountService:getNewMessageCount: count=', count);

    this._newMessageCount.next(count);
  }
}
