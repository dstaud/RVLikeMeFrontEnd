import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router} from '@angular/router';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { SigninVisibilityService } from './../../core/services/signin-visibility.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  @Output() sideNavClosed = new EventEmitter();

  constructor(private auth: AuthenticationService,
              private signinVisibilityService: SigninVisibilityService,
              private router: Router) { }

  ngOnInit() {
  }

  public closeSideNav = () => {
    this.sideNavClosed.emit();
  }

  public logout() {
    this.auth.logout();
    this.auth.setUserToAuthorized(false);
    this.signinVisibilityService.toggleSignin(true);
    this.router.navigateByUrl('/');
    this.sideNavClosed.emit();
  }
}
