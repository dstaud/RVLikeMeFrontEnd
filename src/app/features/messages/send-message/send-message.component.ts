import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';
import { NewMessageCountService } from '@services/new-msg-count.service';
import { ThemeService } from '@services/theme.service';

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

  constructor(private shareDataSvc: ShareDataService,
              private messagesSvc: MessagesService,
              private newMsgCountSvc: NewMessageCountService,
              private themeSvc: ThemeService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  message: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
    let paramData: any;
    const profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg'; // Default empty profile image

    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });

    // This component expects data passed through a shared data service.  If no data (because user bookmarked this page perhaps), then redirect to message-list component.
    if (!this.shareDataSvc.getData()) {
      this.router.navigateByUrl('/messages/message-list');
    } else {
      paramData = JSON.parse(this.shareDataSvc.getData());
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


  ngOnDestroy() { }


  // Update conversation in database with new message
  onSubmit() {
    const message = this.form.controls.message.value;
    console.log('SendMessageComponent:onSubmit: message=', message);
    this.showSpinner = true;
    this.messagesSvc.sendMessage(this.conversationID, this.fromUserID, this.fromDisplayName, this.fromProfileImageUrl,
                                this.toUserID, this.toDisplayName, this.toProfileImageUrl, message)
    .pipe(untilComponentDestroyed(this))
    .subscribe(messageResult => {
      console.log('result = ', messageResult);
      console.log('SendMessageComponent:onSubmit: result=', messageResult.messages[messageResult.messages.length - 1]);
      this.messages.push(messageResult.messages[messageResult.messages.length - 1]);

      this.myForm.resetForm(); // Only way to reset the form without having it invalidate because field is required.

      console.log('SendMessageComponent:onSubmit: pushed. messages=', this.messages);
      console.log('SendMessageComponent:onSubmit: newConversation=', this.newConversation);
      if (this.newConversation) {
        this.messagesSvc.getConversations();
      } else {
        console.log('SendMessageComponent:onSubmit: new conversation, update conversations');
        this.updateConversation('sent');
      }
      this.showSpinner = false;
    }, error => {
        this.showSpinner = false;
        console.log('SendMessageComponent:onSubmit: throw error ', error);
        throw new Error(error);
    });
  }


  // Use converation ID or from/to users to select the appropriate conversation
  private findConversation(conversations: Iconversation[], fromUserID: string, toUserID: string, conversationID?: string): number {
    let index: number;

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
      if (conversations.length === 1 && conversations[0]._id === null) {
        console.log('MessageListComponent:ngOnInit: default conversation ', conversations);
      } else if (conversations.length === 0) {
        this.newConversation = true;
        this.conversation = null;
        this.conversationID = null;
        this.messages = [];
      } else {
        let conversationIndex = this.findConversation(conversations, this.fromUserID, this.toUserID, this.conversationID);
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
      this.showSpinner = false;
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
    }, error => {
      console.log('SendMessageComponent:updateConversation: throw error ', error);
      throw new Error(error);
    })
  }

}
