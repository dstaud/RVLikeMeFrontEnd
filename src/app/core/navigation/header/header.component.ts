import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ThemeService } from '@services/theme.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-rvlm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input('newMessageCount') newMessageCount: number;

  lightTheme = true;
  profile: IuserProfile;
  userAuthorized: boolean;
  profileImage = false;
  profileImageUrl = null;

  userProfile: Observable<IuserProfile>;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private headerVisibleSvc: HeaderVisibleService,
              private sentry: SentryMonitorService,
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

    this.listenForUserProfile();

    this.listenForUserAuth();
  }

  ngOnDestroy() {}

  changeProfileImage() {
    this.router.navigateByUrl('/profile/personal');
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
  }

  changePassword() {
    this.router.navigateByUrl('/change-password');
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
  }

  changeUsername() {
    this.router.navigateByUrl('/change-username');
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
  }

  logout() {
    this.authSvc.logout();
    this.profileSvc.dispose();
    this.authSvc.setUserToAuthorized(false);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/');
  }

  onSettings() {
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
    this.router.navigateByUrl('/settings');
  }

  onToolbarIcon() {
    this.router.navigateByUrl('/about');
  }

  selectTheme(theme: string) {
    this.lightTheme = !this.lightTheme;

    this.themeSvc.setGlobalColorTheme(theme);
    this.profile.colorThemePreference = theme;
    this.profileSvc.updateProfileAttribute(this.profile._id, 'colorThemePreference', this.profile.colorThemePreference)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.distributeProfileUpdate(responseData);
    }, error => {
      this.sentry.logError('HeaderComponent:selectTheme: cannot get theme '+ JSON.stringify(error));
    });
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  updateProfile() {
    this.router.navigateByUrl('/profile/main');
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
  }

  listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile.colorThemePreference === 'light-theme') {
        this.lightTheme = true;
      } else {
        this.lightTheme = false;
      }
      if (this.profile.profileImageUrl) {
        this.profileImageUrl = this.profile.profileImageUrl;
        this.profileImage = true;
      }
    }, (error) => {
      this.sentry.logError('HeaderMobileComponent:listenForUserProfile: error listening for profile=' + JSON.stringify(error))
    });
  }

  listenForUserAuth() {
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
  }
}
