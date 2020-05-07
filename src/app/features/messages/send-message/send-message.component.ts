import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { Location } from '@angular/common';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';
import { NewMessageCountService } from '@services/new-msg-count.service';
import { ThemeService } from '@services/theme.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';

@Component({
  selector: 'app-rvlm-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {

  @ViewChild(FormGroupDirective) myForm;

  form: FormGroup;
  fromUserID: string;
  fromDisplayName: string;
  fromProfileImageUrl: string;
  toUserID: string;
  toDisplayName: string;
  toProfileImageUrl: string;
  messages: Array<Imessage> = [];
  conversation: Iconversation;
  theme: string;

  showSpinner: boolean = false;

  private conversationID: string;
  private originalMsgCount: number = 0;
  private newConversation: boolean = false;
  private userConversations: Observable<Iconversation[]>;
  private backPath: string = '';

  constructor(private shareDataSvc: ShareDataService,
              private authSvc: AuthenticationService,
              private messagesSvc: MessagesService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private newMsgCountSvc: NewMessageCountService,
              private themeSvc: ThemeService,
              private emailSmtpSvc: EmailSmtpService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  message: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.listenForChangeInColorTheme();

    this.getParameters();
  }


  ngOnDestroy() { }


  // Update conversation in database with new message
  onSubmit() {
    const message = this.form.controls.message.value;
    this.showSpinner = true;
    this.messagesSvc.sendMessage(this.conversationID, this.fromUserID, this.fromDisplayName, this.fromProfileImageUrl,
                                this.toUserID, this.toDisplayName, this.toProfileImageUrl, message)
    .pipe(untilComponentDestroyed(this))
    .subscribe(messageResult => {
      this.messages.push(messageResult.messages[messageResult.messages.length - 1]);

      this.myForm.resetForm(); // Only way to reset the form without having it invalidate because field is required.

      if (this.newConversation) {
        this.messagesSvc.getConversations();
        this.sendNotificationToRecipient();
      } else {
        this.updateConversation('sent');
      }
      this.showSpinner = false;
    }, error => {
        this.showSpinner = false;
        console.error('SendMessageComponent:onSubmit: error sending message ', error);
        throw new Error(error);
    });
  }


  // Use converation ID or from/to users to select the appropriate conversation
  private findConversation(conversations: Iconversation[], fromUserID: string, toUserID: string, conversationID?: string): number {
    let index: number = -1;

    for (let i=0; i < conversations.length; i++) {
      if (conversationID) {
        if (conversations[i]._id === conversationID) {
          index = i;
          break;
        }
      } else {
        if ((conversations[i].createdBy === fromUserID || conversations[i].createdBy === toUserID) &&
            (conversations[i].withUserID === fromUserID || conversations[i].withUserID === toUserID)) {
          index = i;
          break;
        }
      }
    }
    return index;
  }


  // Get previous messages in this conversation for display
  private getMessages() {
    this.userConversations = this.messagesSvc.conversation$;
    this.userConversations
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversations => {
      console.log('SendMessageComponent:getMessages: conversations from DB= ', conversations);
      if (conversations.length === 1 && conversations[0]._id === null) {
        console.log('SendMessageComponent:getMessages: default conversation ', conversations);
      } else {
        let conversationIndex = this.findConversation(conversations, this.fromUserID, this.toUserID, this.conversationID);
        console.log('SendMessageComponent:getMessages: conversation index ', conversationIndex);
        if (conversationIndex === -1) { // Indicates not found in collection
          this.newConversation = true;
          this.conversation = null;
          this.conversationID = null;
          this.messages = [];
        } else {
          this.conversation = conversations[conversationIndex];
          this.conversationID = this.conversation._id;
          this.newConversation = false;
          this.messages = conversations[conversationIndex].messages;

          if (conversations[conversationIndex].createdBy === this.fromUserID) {
            this.originalMsgCount = conversations[conversationIndex].createdByUnreadMessages;
          } else {
            this.originalMsgCount = conversations[conversationIndex].withUserUnreadMessages;
          }
          if (this.originalMsgCount > 0) {
            this.updateConversation('read');
            this.newMsgCountSvc.updateMessageCount(this.originalMsgCount);
            this.originalMsgCount = 0;
          }
        }
      }
      this.showSpinner = false;
    });
  }

  // This component expects data passed through a shared data service.
  // If no data (because user bookmarked this page perhaps), then redirect to message-list component.
  // Once have parameters, take action
  private getParameters() {
    const profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg'; // Default empty profile image
    let paramData: any;

    if (!this.shareDataSvc.getData()) {
      this.router.navigateByUrl('/messages/message-list');
    } else {
      paramData = this.shareDataSvc.getData();
      this.fromUserID = paramData.fromUserID;
      this.fromDisplayName = paramData.fromDisplayName;
      if (!paramData.fromProfileImageUrl || paramData.fromProfileImageUrl === 'null') {
        this.fromProfileImageUrl = profileImageUrl;
      } else {
        this.fromProfileImageUrl = paramData.fromProfileImageUrl;
      }
      this.toUserID = paramData.toUserID;
      this.toDisplayName = paramData.toDisplayName;
      if (!paramData.toProfileImageUrl || paramData.toProfileImageUrl === 'null') {
        this.toProfileImageUrl = profileImageUrl;
      } else {
        this.toProfileImageUrl = paramData.toProfileImageUrl;
      }
      if (paramData.conversationID && paramData.conversationID !== 'null') {
        this.conversationID = paramData.conversationID;
      }

      this.getMessages();
    }
  }


  // Listen for changes in color theme;
  private listenForChangeInColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });
  }


  // Send notification to recipient about new message
  private sendNotificationToRecipient() {
    this.authSvc.getOtherUserEmail(this.toUserID)
    .subscribe(userResult => {
      console.log('SendMessageComponent:sendNotificationToRecipient: userResult=', userResult);
      this.emailSmtpSvc.sendMessageAlertEmail(userResult.email)
      .subscribe(emailResult => {
        console.log('SendMessageComponent:sendNotificationToRecipient: emailResult=', emailResult);
      }, error => {
        console.log('SendMessageComponent:sendNotificationToRecipient: error sending email=', error);
      });
    }, error => {
      console.log('SendMessageComponent:sendNotificationToRecipient: error getting other user=', error);
    });
  }


  // Update count of unread messages in conversation in database
  // If user viewed unread messages, set to zero
  // If user sent a new message, add to the count for the person sent to.
  private updateConversation(action: string) {
    let userIdType: string;
    let messageCount: number;

    if (this.conversation.createdBy === this.fromUserID) {
      userIdType = 'createdBy';
    } else {
      userIdType = 'withUserID';
    }

    this.messagesSvc.updateConversation(this.conversationID, userIdType, action)
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversationResult => {
      this.messagesSvc.getConversations(); // Get updated conversation into behaviorSubject
      this.sendNotificationToRecipient();
    }, error => {
      console.error('SendMessageComponent:updateConversation: throw error ', error);
      throw new Error(error);
    })
  }

}
