import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { MessagesService } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  showSpinner: boolean = false;
  conversations: Array<JSON> = [];
  displayName: string;
  userID: string;

   // Interface for profile data
   profile: IuserProfile;
   userProfile: Observable<IuserProfile>;

  constructor(private messagesSvc: MessagesService,
              private profileSvc: ProfileService,
              private shareDataSvc: ShareDataService,
              private router: Router) { }

  ngOnInit(): void {
    // Listen for Profile changes
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile.userID) {
        this.userID = this.profile.userID;
        this.displayName = this.profile.displayName;
        this.getMessages();
      }
    }, (error) => {
      console.error(error);
    });
  }

  ngOnDestroy() {}

  getMessages(): void {
    let previousPair1: string;
    let previousPair2: string;
    let newPair: string;

    this.messagesSvc.getMessages()
    .subscribe(messagesResult => {
      console.log('MessageListComponent:getMessages: result=', messagesResult);

      previousPair1 = messagesResult[0].createdBy + messagesResult[0].messageUserID;
      previousPair2 = messagesResult[0].messageUserID + messagesResult[0].createdBy;
      console.log('MessageListComponent:getMessages: result 0=',messagesResult[0] );
      this.conversations.push(messagesResult[0]);

      for (let i=1; i < messagesResult.length; i++) {
        newPair = messagesResult[i].createdBy + messagesResult[i].messageUserID;

        if (newPair !== previousPair1 && newPair !== previousPair2) {
          this.conversations.push(messagesResult[i]);
        }
      }

      console.log('MessageListComponent:getMessages: array=', this.conversations);
      this.showSpinner = false;
    }, error => {
      // if no messages for pair found, that is OK.
      if (error.status !== 404) {
        console.log(error);
        this.showSpinner = false;
      }
    })
  }

  onSelectMessage(user: string, row: number) {
    let params: any;

    if (user === 'message') {
      params = '{"fromUserID":"' + this.conversations[row].createdBy + '",' +
              '"fromDisplayName":"' + this.conversations[row].createdBydisplayName + '",' +
              '"fromProfileImageUrl":"' + this.conversations[row].createdByprofileImageUrl + '",' +
              '"toUserID":"' + this.conversations[row].messageUserID + '",' +
              '"toDisplayName":"' + this.conversations[row].messageDisplayName + '",' +
              '"toProfileImageUrl":"' + this.conversations[row].messageProfileImageUrl + '"}';

      console.log('MessageListComponent:navigateToMessages: params=', params);

      this.shareDataSvc.setData(params);
      this.router.navigateByUrl('/messages/send-message');
    } else {
      console.log(this.conversations[row].createdByDisplayName)
    }
  }
}
