import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { SentryMonitorService } from '@services/sentry-monitor.service';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  userMessage: string;
  desktop: boolean = false;

  constructor(private sentry: SentryMonitorService,
              private location: Location,
              private router: Router,
              private headervisibleSvc: HeaderVisibleService,
              private authSvc: AuthenticationService) {
            if (window.innerWidth > 600) {
              this.headervisibleSvc.toggleHeaderDesktopVisible(true);
              this.desktop = true;
            } else {
              this.headervisibleSvc.toggleHeaderVisible(true);
            }
  }

  ngOnInit() {
    let errorMessage: string;

    if (this.authSvc.isLoggedIn()) {
      errorMessage = 'Page Not Found. User logged in. Path=' + this.location.path();
      this.userMessage = 'Oops.  Sorry, but this page was not found.  You will be redirected to your home page in a few seconds.';
    } else {
      errorMessage = 'Page Not Found. User NOT logged in. Path=' + this.location.path();
      this.userMessage = 'Oops.  Sorry, but this page was not found.  You will be redirected to the sign in page in a few seconds.';
    }

    this.sentry.logError(JSON.stringify({"message":errorMessage}));
  }

  ngAfterViewInit() {
    let self = this;

    setTimeout(function () {
      self.router.navigateByUrl('/home/main');
    }, 5000);

  }
}
