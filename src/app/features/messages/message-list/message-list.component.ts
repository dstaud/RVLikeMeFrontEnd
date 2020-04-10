import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  showSpinner: boolean = false;
  conversations: Array<Iconversation> = [];
  displayName: string;
  userID: string;
  noConversations: boolean = false;

   // Interface for profile data
   profile: IuserProfile;
   userProfile: Observable<IuserProfile>;

  constructor(private messagesSvc: MessagesService,
              private profileSvc: ProfileService,
              private shareDataSvc: ShareDataService,
              private router: Router) { }

  ngOnInit(): void {
    this.showSpinner = true;

    // Listen for Profile changes
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      console.log('MessageListComponent:ngOnInit: got profile =', this.profile.userID);
      if (this.profile.userID) {
        this.userID = this.profile.userID;
        this.displayName = this.profile.displayName;
        console.log('MessageListComponent:ngOnInit: getting conversations');
        this.getConversations();
      }
    }, (error) => {
      console.error(error);
    });
  }

  ngOnDestroy() {}

  onGroup() {
    this.router.navigateByUrl('forums');
  }

  getConversations(): void {
    console.log('MessageListComponent:getConversations: in getConversations');
    this.messagesSvc.getConversations()
    .subscribe(messagesResult => {
      console.log('MessageListComponent:getConversations: result=', messagesResult);
      this.conversations = messagesResult;
      if (this.conversations.length === 0) {
        this.noConversations = true;
      }
      console.log('MessageListComponent:getConversations: array=', this.conversations);
      this.showSpinner = false;
    }, error => {
      // if no messages for pair found, that is OK.
      if (error.status === 404) {
        this.noConversations = true;
        this.showSpinner = false;
      } else {
        console.log(error);
        this.showSpinner = false;
      }
    });
  }

  onSelectSendTo(row: number) {
    let params: any;
    let fromUserID: string;
    let fromDisplayName: string;
    let fromProfileImageUrl: string;
    let toUserID: string;
    let toDisplayName: string;
    let toProfileImageUrl: string;

    if (this.conversations[row].createdBy === this.userID) {
      fromUserID = this.conversations[row].createdBy;
      fromDisplayName = this.conversations[row].createdByDisplayName;
      fromProfileImageUrl = this.conversations[row].createdByProfileImageUrl;
      toUserID = this.conversations[row].withUserID;
      toDisplayName = this.conversations[row].withUserDisplayName;
      toProfileImageUrl = this.conversations[row].withUserProfileImageUrl;
    } else {
      fromUserID = this.conversations[row].withUserID;
      fromDisplayName = this.conversations[row].withUserDisplayName;
      fromProfileImageUrl = this.conversations[row].withUserProfileImageUrl;
      toUserID = this.conversations[row].createdBy;
      toDisplayName = this.conversations[row].createdByDisplayName;
      toProfileImageUrl = this.conversations[row].createdByProfileImageUrl;
    }
    params = '{"fromUserID":"' + fromUserID + '",' +
            '"fromDisplayName":"' +fromDisplayName + '",' +
            '"fromProfileImageUrl":"' + fromProfileImageUrl + '",' +
            '"toUserID":"' + toUserID + '",' +
            '"toDisplayName":"' + toDisplayName + '",' +
            '"toProfileImageUrl":"' + toProfileImageUrl + '"}';

    console.log('MessageListComponent:navigateToMessages: params=', params);

    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/messages/send-message');
  }
}
