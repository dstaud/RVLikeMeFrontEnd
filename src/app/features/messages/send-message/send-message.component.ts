import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { MessagesService } from '@services/data-services/messages.service';
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
  messages: Array<string> = [];

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
    this.getMessages();
  }

  ngOnDestroy() { }

  getMessages() {
    let data: any;
    const profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg';

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

      this.messagesSvc.getMessagesByUserID(this.fromUserID, this.toUserID, this.toDisplayName, this.toProfileImageUrl)
      .pipe(untilComponentDestroyed(this))
      .subscribe(messagesResult => {
        console.log('SendMessagesComponent:getMessages: RESULT=', messagesResult);
        this.messages = messagesResult;
        this.showSpinner = false;
      }, error => {
        // if no messages for pair found, that is OK.
        if (error.status !== 404) {
          console.log(error);
          this.showSpinner = false;
        }
      });
    }
  }

  onSubmit() {
    const message = this.form.controls.message.value;
    console.log('SendMessageComponent:onSubmit: message=', message);
    this.showSpinner = true;
    this.messagesSvc.sendMessage(this.fromUserID, this.fromDisplayName, this.fromProfileImageUrl,
                                this.toUserID, this.toDisplayName, this.toProfileImageUrl, message)
    .subscribe(messageResult => {
      console.log('result = ', messageResult);
      this.showSpinner = false;
    }, error => {
        console.log(error);
        this.showSpinner = false;
    });
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
