import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  showSpinner: boolean = false;

  private backPath = '';
  private routeSubscription: any;

  constructor(public translate: TranslateService,
              private authSvc: AuthenticationService,
              private router: Router,
              private location: Location,
              private route: ActivatedRoute,
              private activateBackArrowSvc: ActivateBackArrowService) { }

  ngOnInit() {
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    // Get parameters
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      if (params) {
        let queryParams = JSON.parse(params.queryParam);
        console.log('Params=', queryParams);
      }
    });
  }
}
