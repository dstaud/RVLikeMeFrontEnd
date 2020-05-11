import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-rvlm-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  private backPath = '';

  constructor(private router: Router,
              private location: Location) { }

  ngOnInit() {
    if (this.location.path() === '/messages') {
      this.router.navigateByUrl('/messages/message-list');
    }
  }
}
