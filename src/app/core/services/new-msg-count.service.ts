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

    for (let i=0; i < conversations.length; i++) {
      if (conversations[i].createdBy === userID) {
        count = count + conversations[i].createdByUnreadMessages;
      }
      if (conversations[i].withUserID === userID) {
        count = count + conversations[i].withUserUnreadMessages;
      }
    }
    this.messageCount = count;

    this._newMessageCount.next(this.messageCount);
  }

  updateMessageCount(count: number) {
    let newCount;

    newCount = this.messageCount - count;

    this.messageCount = newCount;
    this._newMessageCount.next(this.messageCount);
  }
}
