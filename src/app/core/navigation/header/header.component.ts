import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-rvlm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  lightTheme = true;
  profile: IuserProfile;
  userAuthorized: boolean;

  userProfile: Observable<IuserProfile>;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private headerVisibleSvc: HeaderVisibleService,
              private themeSvc: ThemeService) { }

  ngOnInit() {
    this.router.events
    .pipe(untilComponentDestroyed(this))
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          // this.setTitleOnRouteChange();
        }
      }
    });

    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in header component=', data);
      this.profile = data;
      if (this.profile.colorThemePreference === 'light-theme') {
        this.lightTheme = true;
      } else {
        this.lightTheme = false;
      }
    }, (error) => {
      console.error(error);
    });

/*     this.device = this.deviceSvc.device;

    if (this.device === 'iPhone') {
      // arrow_back_ios icon not coming up at all regardless of this if
      this.arrowIcon = 'arrow_back_ios';
      // this.arrowIcon = 'keyboard_arrow_left';
    } */

    // Listen for changes in user authorization state
    this.authSvc.userAuth$
      .pipe(untilComponentDestroyed(this))
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });


    // If user leaves the page but returns (back on browser, bookmark), and auth token is still valid, return to state
    if (this.authSvc.isLoggedIn()) {
      this.authSvc.setUserToAuthorized(true);
    }

/*     this.activateBackArrowSvc.route$
      .pipe(untilComponentDestroyed(this))
      .subscribe(data => {
        this.returnRoute = data.valueOf();
        if (this.returnRoute) {
          if (this.returnRoute.substring(0, 1) === '*') {
              this.returnRoute = this.returnRoute.substring(1, this.returnRoute.length);
              this.autoRoute = true;
              this.showBackArrow = false;
            } else {
              this.showBackArrow = true;
            }
          } else {
              this.showBackArrow = false;
              this.autoRoute = false;
          }
      }); */
  }

  ngOnDestroy() {}

  changeUsername() {
    this.router.navigateByUrl('/credentials');
    this.activateBackArrowSvc.setBackRoute('/home');
  }


  logout() {
    this.authSvc.logout();
    this.profileSvc.dispose();
    this.authSvc.setUserToAuthorized(false);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/');
  }


  selectTheme(theme: string) {
    this.lightTheme = !this.lightTheme;

    this.themeSvc.setGlobalColorTheme(theme);
    this.profile.colorThemePreference = theme;
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      console.log('update color theme response = ', responseData);
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      console.log(error);
    });
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
