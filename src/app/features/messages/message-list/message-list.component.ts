import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  conversations: Array<Iconversation> = [];
  displayName: string;
  userID: string;
  noConversations: boolean = false;

  showSpinner: boolean = false;

   // Interface for profile data
   private profile: IuserProfile;
   private userProfile: Observable<IuserProfile>;
   private userConversations: Observable<Iconversation[]>;

  constructor(private messagesSvc: MessagesService,
              private profileSvc: ProfileService,
              private shareDataSvc: ShareDataService,
              private location: Location,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/signin');
    } else {
      this.showSpinner = true;

      this.listenForUserProfile();

      this.listenForUserConversations();
    }
  }


  ngOnDestroy() {}

  onClickGoToGroup() {
    this.activateBackArrowSvc.setBackRoute('messages/message-list', 'forward');
    this.router.navigateByUrl('/forums/forums-list');
  }

  // When user clicks on a conversation, extract the information needed on the SendMessageComponent,
  // save it for that component and navigate
  onSelectSendTo(row: number) {
    this.setParameters(row);
    this.activateBackArrowSvc.setBackRoute('messages/message-list', 'forward');
    this.router.navigateByUrl('/messages/send-message');
  }


  // Listen for conversations for this user.
  private listenForUserConversations() {
    this.userConversations = this.messagesSvc.conversation$;
    this.userConversations
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversations => {
      if (conversations.length === 1 && conversations[0]._id === null) {
      } else if (conversations.length === 0) {
        this.noConversations = true;
        this.showSpinner = false;
      } else {
        this.noConversations = false;
        this.conversations = conversations;
        this.showSpinner = false;
      }
    });
  }


  // Listen for Profile changes
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile.userID) {
        this.userID = this.profile.userID;
        this.displayName = this.profile.displayName;
      }
    }, (error) => {
      console.error(error);
    });
  }


  // Set parameters for selected row
  private setParameters(row) {
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

    this.shareDataSvc.setData(JSON.parse(params));
  }
}
