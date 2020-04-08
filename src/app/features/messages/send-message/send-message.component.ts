import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { MessagesService } from '@services/data-services/messages.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {
  showSpinner: boolean = false;

  private routeSubscription: any;
  private backPath = '';

  constructor(private route: ActivatedRoute,
              private shareDataSvc: ShareDataService,
              private messagesSvc: MessagesService) { }

  ngOnInit(): void {
    this.getMessages();
  }

  ngOnDestroy() { }

  getMessages() {
    let fromUserID: string;
    let toUserID: string;
    let data: any;
    let profileImageUrl: string = './../../../../assets/images/no-profile-pic.jpg';

    if (!this.shareDataSvc.getData()) {
      console.log('SendMessageComponent:getMessages: no parameters');
    } else {
      data = JSON.parse(this.shareDataSvc.getData());

      console.log('SendMessagesComponent:getMessages: Params=', data, data.fromUserID);

      if (data.toProfileImageUrl) {
        profileImageUrl = data.toProfileImageUrl;
      }

      this.messagesSvc.getMessagesByUserID(data.fromUserID, data.toUserID, data.toDisplayName, profileImageUrl)
      .pipe(untilComponentDestroyed(this))
      .subscribe(messagesResult => {
        console.log('SendMessagesComponent:getMessages: RESULT=', messagesResult);
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
}
