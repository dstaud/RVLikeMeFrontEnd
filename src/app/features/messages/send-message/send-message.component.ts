import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { NewMsgCountService } from '@services/new-msg-count.service';
import { ShareDataService } from '@services/share-data.service';

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

  private conversationID: string;
  private newConversation: boolean = false;

  showSpinner: boolean = false;

  constructor(private shareDataSvc: ShareDataService,
              private messagesSvc: MessagesService,
              private newMsgCountSvc: NewMsgCountService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  message: new FormControl('', Validators.required)
                });
     }

  ngOnInit(): void {
    let data: any;
    const profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg';

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

      this.getMessages();
    }
  }

  ngOnDestroy() { }

  getMessages() {
    this.showSpinner = true;

    this.messagesSvc.getConversation(this.fromUserID, this.toUserID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversationResult => {
      console.log('sendMessageComponent:getMessages: RESULT=', conversationResult);
      if (conversationResult.length === 0) {
        this.conversation = null;
        this.conversationID = null;
        this.messages = [];
        this.newConversation = true;
      } else {
        this.conversation = conversationResult[0];
        this.conversationID = this.conversation._id;
        this.newConversation = false;
        console.log('sendMessageComponent:getMessages: conversation=', this.conversation);
        this.messages = conversationResult[0].messages;
        console.log('sendMessageComponent:getMessages: messages=', this.messages);
        this.updateConversation('read');
      }
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.log('SendMessageComponent:getMessages: throw error ', error);
      throw new Error(error);
    });
  }

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

      if (!this.newConversation) {
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
      this.newMsgCountSvc.getNewMessageCount(this.fromUserID);
    }, error => {
      console.log('SendMessageComponent:updateConversation: throw error ', error);
      throw new Error(error);
    })
  }

}
