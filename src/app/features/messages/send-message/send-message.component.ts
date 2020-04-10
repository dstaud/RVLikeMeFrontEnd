import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {
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
      console.log('SendMessagesComponent:getMessages: data=', data);
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
      console.log('SendMessagesComponent:getMessages: fromUserID=', this.fromUserID);
      console.log('SendMessagesComponent:getMessages: fromdisplayName=', this.fromDisplayName);
      console.log('SendMessagesComponent:getMessages: fromProfileImageUrl=', this.fromProfileImageUrl);
      console.log('SendMessagesComponent:getMessages: toUserID=', this.toUserID);
      console.log('SendMessagesComponent:getMessages: toDisplayName=', this.toDisplayName);
      console.log('SendMessagesComponent:getMessages: toProfileImageUrl=', this.toProfileImageUrl);

      this.getMessages();
    }
  }

  ngOnDestroy() { }

  getMessages() {
    this.messagesSvc.getConversation(this.fromUserID, this.toUserID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(conversationResult => {
      console.log('SendMessagesComponent:getMessages: RESULT=', conversationResult);
      if (conversationResult.length === 0) {
        this.conversation = null;
        this.conversationID = null;
        this.messages = [];
        this.newConversation = true;
      } else {
        this.conversation = conversationResult[0];
        this.conversationID = this.conversation._id;
        this.newConversation = false;
        console.log('SendMessagesComponent:getMessages: conversation=', this.conversation);
        this.messages = conversationResult[0].messages;
        console.log('SendMessagesComponent:getMessages: messages=', this.messages);
        this.updateConversation('read');
      }
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
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
      if (!this.newConversation) {
        this.updateConversation('sent');
      }
      this.showSpinner = false;
    }, error => {
        console.log(error);
        this.showSpinner = false;
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
    }, error => {
        console.log(error);
    })
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    console.log(string, newString);
    return newString;
  }
}
