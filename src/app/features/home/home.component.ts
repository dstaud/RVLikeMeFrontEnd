import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
// import { ProfileService } from '@services/data-services/profile.service';


@Component({
  selector: 'app-rvlm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  backPath = '';

  constructor(public translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              // private profileSvc: ProfileService,
              private router: Router) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }
    // console.log('HomeComponent:ngOnInit: get profile')
    // this.profileSvc.getProfile();
  }

  setBackRoute() {
    this.activateBackArrowSvc.setBackRoute('home');
  }

  throwError() {
    throw new Error('test Sentry error handling');
  }
}
