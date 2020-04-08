import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {
  sendToUserID: string;

  private routeSubscription: any;
  private backPath = '';

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    console.log('AddMessageComponent:ngOnInit')
    // Get parameters
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      console.log('SendMessagesComponent:ngOnInit: Params=', params, JSON.stringify(params));
      if (JSON.stringify({}) != JSON.stringify(params)) {
        console.log('SendMessagesComponent:ngOnInit: Params=', params);
        this.sendToUserID = JSON.parse(params.queryParam).userID;
        console.log('SendMessagesComponent:ngOnInit: send to=', this.sendToUserID);
      }
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

}
