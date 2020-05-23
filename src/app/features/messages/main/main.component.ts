import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { SendMessageComponent } from './../send-message/send-message.component';
import { ImessageShareData } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild(SendMessageComponent)
  public sendMessage: SendMessageComponent;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (window.innerWidth <= 600) {
      this.router.navigateByUrl('forums/posts-main');
    }
  }

  onConversationSelected(conversationParams: ImessageShareData) {
    this.sendMessage.getParameters(conversationParams);
  }
}
