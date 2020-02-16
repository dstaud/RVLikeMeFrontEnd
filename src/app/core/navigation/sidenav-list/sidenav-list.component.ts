import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router} from '@angular/router';
import { Location } from '@angular/common';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { SigninButtonVisibleService } from '@services/signin-btn-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  backPath = '';

  @Output() sideNavClosed = new EventEmitter();

  constructor(private authSvc: AuthenticationService,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit() {
  }

  public closeSideNav = () => {
    this.backPath = this.location.path().substring(1, this.location.path().length);
    this.activateBackArrowSvc.setBackRoute(this.backPath);
    this.sideNavClosed.emit();
  }
}
