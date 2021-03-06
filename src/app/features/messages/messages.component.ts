import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-rvlm-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  animations: [fadeAnimation]
})
export class MessagesComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) { }

  ngOnInit() {
    if (this.location.path() === '/messages') {
      this.router.navigateByUrl('/messages/message-list');
    }
  }
}
