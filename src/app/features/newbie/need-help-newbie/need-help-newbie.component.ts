import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';

@Component({
  selector: 'app-need-help-newbie',
  templateUrl: './need-help-newbie.component.html',
  styleUrls: ['./need-help-newbie.component.scss']
})
export class NeedHelpNewbieComponent implements OnInit {

  constructor(private authSvc: AuthenticationService,
    private activateBackArrowSvc: ActivateBackArrowService,
    private location: Location,
    private router: Router) { }

  ngOnInit(): void {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/signin');
    }
  }
}
