import { Injectable, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { Iconversation } from '@services/data-services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class NewMessageCountService {
  messageCount: number;

  private _newMessageCount = new Subject<number>();
  newMessageCount$ = this._newMessageCount.asObservable();

  constructor() { }

  ngOnDestroy() {}

  getNewMessageCount(userID: string, conversations: Iconversation[]): void {
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
    this.messageCount = count;
    console.log('NewMsgCountService:getNewMessageCount: count=', this.messageCount);

    this._newMessageCount.next(this.messageCount);
  }

  updateMessageCount(count: number) {
    let newCount;

    newCount = this.messageCount - count;
    console.log('NewMessageCountService:updateMessageCount: original count=', this.messageCount, ' new count=', newCount);

    this.messageCount = newCount;
    this._newMessageCount.next(this.messageCount);
  }
}
