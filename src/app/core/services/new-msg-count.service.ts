import { Injectable, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { MessagesService } from '@services/data-services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class NewMsgCountService {
  private _newMessageCount = new Subject<number>();
  newMessageCount$ = this._newMessageCount.asObservable();

  constructor(private messagesSvc: MessagesService) { }

  ngOnDestroy() {}

  public getNewMessageCount(userID: string): void {
    let count: number = 0;

    console.log('NewMsgCountService:getNewMessageCount: getting new message count');

    this.messagesSvc.getConversations()
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversationsResult => {
      console.log('NewMsgCountService:getNewMessageCount: got conversations ', conversationsResult, userID);

      for (let i=0; i < conversationsResult.length; i++) {
        if (conversationsResult[i].createdBy === userID) {
          count = count + conversationsResult[i].createdByUnreadMessages;
          console.log('NewMsgCountService:getNewMessageCount: createdBy count=', conversationsResult[i].createdByUnreadMessages, count);
        }
        if (conversationsResult[i].withUserID === userID) {
          count = count + conversationsResult[i].withUserUnreadMessages;
          console.log('NewMsgCountService:getNewMessageCount: withUser count=', conversationsResult[i].withUserUnreadMessages, count);
        }
      }
      console.log('NewMsgCountService:getNewMessageCount: count=', count);

      this._newMessageCount.next(count);
    }, (error) => {
      if (error.status === 404) {
        console.log('NewMsgCountService:getNewMessageCount: no conversations found');
      } else {
        console.error(error);
        console.log('NewMsgCountService:getNewMessageCount: error getting new message count', error);
      }
    });
  }

}
