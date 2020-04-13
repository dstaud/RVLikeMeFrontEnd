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

  private conversationID: string;
  private originalMsgCount: number = 0;
  private newConversation: boolean = false;
  private userConversations: Observable<Iconversation[]>;


  showSpinner: boolean = false;

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
    let data: any;
    const profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg';

    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });

    // This component expects data passed through a shared data service.  If no data, then redirect to message-list component.
    if (!this.shareDataSvc.getData()) {
      console.log('SendMessageComponent:getMessages: no parameters');
      this.router.navigateByUrl('/messages/message-list');
    } else {
      data = JSON.parse(this.shareDataSvc.getData());
      console.log('sendMessageComponent:getMessages: data=', data);
      this.fromUserID = data.fromUserID;
      this.fromDisplayName = data.fromDisplayName;
      if (!data.fromProfileImageUrl || data.fromProfileImageUrl === 'null') {
        this.fromProfileImageUrl = profileImageUrl;
      } else {
        this.fromProfileImageUrl = data.fromProfileImageUrl;
      }
      this.toUserID = data.toUserID;
      this.toDisplayName = data.toDisplayName;
      if (!data.toProfileImageUrl || data.toProfileImageUrl === 'null') {
        this.toProfileImageUrl = profileImageUrl;
      } else {
        this.toProfileImageUrl = data.toProfileImageUrl;
      }
      console.log('sendMessageComponent:getMessages: fromUserID=', this.fromUserID);
      console.log('sendMessageComponent:getMessages: fromdisplayName=', this.fromDisplayName);
      console.log('sendMessageComponent:getMessages: fromProfileImageUrl=', this.fromProfileImageUrl);
      console.log('sendMessageComponent:getMessages: toUserID=', this.toUserID);
      console.log('sendMessageComponent:getMessages: toDisplayName=', this.toDisplayName);
      console.log('sendMessageComponent:getMessages: toProfileImageUrl=', this.toProfileImageUrl);

      this.userConversations = this.messagesSvc.conversation$;
      this.userConversations
      .pipe(untilComponentDestroyed(this))
      .subscribe(conversations => {
        console.log('MessageListComponent:ngOnInit: got new conversations', conversations);
        if (conversations.length === 1 && conversations[0]._id === null) {
          console.log('MessageListComponent:ngOnInit: default conversation ', conversations);
        } else if (conversations.length === 0) {
          this.conversation = null;
          this.conversationID = null;
          this.messages = [];
          this.newConversation = true;
          console.log('SendMessageComponent:getMessages newConversation=', this.newConversation);
        } else {
          console.log('MessageListComponent:ngOnInit: have a real conversation=', conversations);
          this.conversation = conversations[0];
          this.conversationID = this.conversation._id;
          this.newConversation = false;
          console.log('sendMessageComponent:getMessages: conversation=', this.conversation), this.newConversation;
          this.messages = conversations[0].messages;
          console.log('sendMessageComponent:getMessages: messages=', this.messages);

          if (conversations[0].createdBy === this.fromUserID) {
            console.log('sendMessageComponent:getMessages: original createdBy unread count=', this.originalMsgCount);
            this.originalMsgCount = conversations[0].createdByUnreadMessages;
            console.log('sendMessageComponent:getMessages: original createdBy new unread count=', this.originalMsgCount);
          } else {
            console.log('sendMessageComponent:getMessages: original withUser unread count=', this.originalMsgCount);
            this.originalMsgCount = conversations[0].withUserUnreadMessages;
            console.log('sendMessageComponent:getMessages: original withUser new unread count=', this.originalMsgCount);
          }
          if (this.originalMsgCount > 0) {
            console.log('sendMessageComponent:getMessages: count > 0 updating conversation and count. was=', this.originalMsgCount);
            this.updateConversation('read');
            this.newMsgCountSvc.updateMessageCount(this.originalMsgCount);
            this.originalMsgCount = 0;
            console.log('sendMessageComponent:getMessages: after update count=', this.originalMsgCount);
          }
        }
        this.showSpinner = false;
      });
    }
  }


  ngOnDestroy() { }


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


  private updateConversation(action: string) {
    let userIdType: string;
    let messageCount: number;

    console.log('SendMessageComponent:updateConversationAsRead: id=', this.conversationID);
    if (this.conversation.createdBy === this.fromUserID) {
      userIdType = 'createdBy';
    } else {
      userIdType = 'withUserID';
    }

    this.messagesSvc.updateConversation(this.conversationID, userIdType, action)
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversationResult => {
      console.log('SendMessageComponent:processUnreadMessages: marked as read, result=', conversationResult);
      this.messagesSvc.getConversations(); // Get updated conversation into behaviorSubject
    }, error => {
      console.log('SendMessageComponent:updateConversation: throw error ', error);
      throw new Error(error);
    })
  }

}
