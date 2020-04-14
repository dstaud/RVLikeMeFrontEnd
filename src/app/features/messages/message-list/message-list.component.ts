import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
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
  userConversations: Observable<Iconversation[]>;
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
      }
    }, (error) => {
      console.error(error);
    });

    this.userConversations = this.messagesSvc.conversation$;
    this.userConversations
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversations => {
      console.log('MessageListComponent:ngOnInit: got new conversations', conversations);
      if (conversations.length === 1 && conversations[0]._id === null) {
        console.log('MessageListComponent:ngOnInit: default conversation ', conversations);
      } else if (conversations.length === 0) {
        this.noConversations = true;
        this.showSpinner = false;
      } else {
        console.log('MessageListComponent:ngOnInit: have a real conversation=', conversations);
        this.noConversations = false;
        this.conversations = conversations;
        this.showSpinner = false;
      }
    });
  }


  ngOnDestroy() {}

  onGroup() {
    this.router.navigateByUrl('forums');
  }

  // When user clicks on a conversation, extract the information needed on the SendMessageComponent, save save it for that component and navigate
  onSelectSendTo(row: number) {
    let params: any;
    let fromUserID: string;
    let fromDisplayName: string;
    let fromProfileImageUrl: string;
    let toUserID: string;
    let toDisplayName: string;
    let toProfileImageUrl: string;
    let conversationID: string;

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
    conversationID = this.conversations[row]._id;

    params = '{"fromUserID":"' + fromUserID + '",' +
            '"fromDisplayName":"' +fromDisplayName + '",' +
            '"fromProfileImageUrl":"' + fromProfileImageUrl + '",' +
            '"toUserID":"' + toUserID + '",' +
            '"toDisplayName":"' + toDisplayName + '",' +
            '"toProfileImageUrl":"' + toProfileImageUrl + '",' +
            '"conversationID":"' + conversationID + '"}';

    console.log('MessageListComponent:navigateToMessages: params=', params);

    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/messages/send-message');
  }
}
