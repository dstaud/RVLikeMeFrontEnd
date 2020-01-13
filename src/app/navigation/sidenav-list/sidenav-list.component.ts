import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router} from '@angular/router';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';

@Component({
  selector: 'app-rvlm-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  @Output() sideNavClosed = new EventEmitter();

  constructor(private authSvc: AuthenticationService,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              private router: Router) { }

  ngOnInit() {
  }

  public closeSideNav = () => {
    this.sideNavClosed.emit();
  }

  public logout() {
    this.authSvc.logout();
    this.authSvc.setUserToAuthorized(false);
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
    this.router.navigateByUrl('/');
    this.sideNavClosed.emit();
  }
}
