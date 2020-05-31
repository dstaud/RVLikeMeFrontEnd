import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { DeviceService } from '@services/device.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';


@Component({
  selector: 'app-rvlm-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {

  @Input('newMessageCount') newMessageCount: number;

  pageTitle = 'RV Like Me';
  userAuthorized$: Observable<boolean>;
  userAuthorized = false;
  registerVisible = false;
  showSpinner = false;
  showBackArrow = false;
  arrowIcon = 'arrow_back';
  returnRoute = '';
  autoRoute = false;
  device: string;
  lightTheme = true;
  profileImage = false;
  profileImageUrl = null;

  // Interface for profile data
  profile: IuserProfile;

  userProfile: Observable<IuserProfile>;

  constructor(private translate: TranslateService,
              private router: Router,
              private deviceSvc: DeviceService,
              private profileSvc: ProfileService,
              private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private sentry: SentryMonitorService,
              private authSvc: AuthenticationService) { }

  ngOnInit() {
    this.listenRouterEvents();

    this.listenForUserProfile();

    this.setDeviceSettings();

    this.listenForAuthChanges();

    // If user leaves the page but returns (back on browser, bookmark), and auth token is still valid, return to state
    if (this.authSvc.isLoggedIn()) {
      this.authSvc.setUserToAuthorized(true);
    }

    this.setReturnRoute();
  }

  ngOnDestroy() {}


  onChangeProfileImage() {
    this.router.navigateByUrl('/profile/personal');
    this.activateBackArrowSvc.setBackRoute('profile/main', 'forward');
  }


  onChangePassword() {
    this.router.navigateByUrl('/credentials/change-password');
    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
  }


  onChangeUsername() {
    this.router.navigateByUrl('/credentials/change-username');
    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
  }


  onUpdateProfile() {
    this.router.navigateByUrl('/profile/main');
    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
  }


  onLogout() {
    this.authSvc.logout();
    this.profileSvc.dispose();
    this.authSvc.setUserToAuthorized(false);
    this.headerVisibleSvc.toggleHeaderVisible(false);
    this.activateBackArrowSvc.setBackRoute('', 'nostack');
    this.router.navigateByUrl('/');
  }


  onSettings() {
    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
    this.router.navigateByUrl('/settings');
  }


  returnToBackRoute() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    if (route === '/') {
      this.headerVisibleSvc.toggleHeaderVisible(false);
    }
    this.router.navigateByUrl(route);
  }


  // Listen for changes in user authorization state
  private listenForAuthChanges() {
    this.authSvc.userAuth$
    .pipe(untilComponentDestroyed(this))
    .subscribe(authData => {
      this.userAuthorized = authData.valueOf();
    });
  }


  // Listen for user profile and take action
  private listenForUserProfile() {
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
      this.sentry.logError('HeaderMobileComponet:listenForUserProfile: error getting profile=' + error)
    });
  }


  // Used to display title in header, but may need this for other reasons so keeping for now
  private listenRouterEvents() {
    this.router.events
    .pipe(untilComponentDestroyed(this))
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.setTitleOnRouteChange();
        }
      }
    });
  }


  // Set arrow based on device
  private setDeviceSettings() {
    this.device = this.deviceSvc.device;

    if (this.device === 'iPhone') {
      // arrow_back_ios icon not coming up at all regardless of this if
      this.arrowIcon = 'arrow_back_ios';
      // this.arrowIcon = 'keyboard_arrow_left';
    }
  }


  private setReturnRoute() {
    let returnStack: Array<string> = [];
    let i: number;

    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      returnStack = data;
      i = returnStack.length - 1;
      if (returnStack.length > 0) {
        if (returnStack[i].substring(0, 1) === '*') {
            this.returnRoute = returnStack[i].substring(1, returnStack[i].length);
            this.autoRoute = true;
            this.showBackArrow = false;
          } else {
            this.returnRoute = returnStack[i];
            this.showBackArrow = true;
          }
      } else {
          this.returnRoute = '';
          this.showBackArrow = false;
          this.autoRoute = false;
      }
    }, error => {
      this.sentry.logError('HeaderMobileComponent:setReturnRoute: error setting return route ' + error);
    });
  }

  // Current not used.  Consider removing.
  private setTitleOnRouteChange(): void {
    if (this.router.url.includes('home')) {
     this.pageTitle = this.translate.instant('home.component.header');
    } else {
      if (this.router.url.includes('forums')) {
        this.pageTitle = this.translate.instant('forums.component.header');
      } else {
        if (this.router.url.includes('messages')) {
          this.pageTitle = this.translate.instant('messages.component.header');
        } else {
          if (this.router.url.includes('connections')) {
            this.pageTitle = this.translate.instant('connections.component.header');
          } else {
            if (this.router.url.includes('about')) {
              this.pageTitle = this.translate.instant('about.component.header');
            } else {
              if (this.router.url.includes('profile-personal')) {
                this.pageTitle = this.translate.instant('profile.component.header') +
                ' - ' +
                this.translate.instant('profile.component.personal');
              } else {
                if (this.router.url.includes('profile-lifestyle')) {
                  this.pageTitle = this.translate.instant('profile.component.lifestyle');
                } else {
                  if (this.router.url.includes('profile-rig')) {
                    this.pageTitle = this.translate.instant('profile.component.rig');
                  } else {
                    if (this.router.url.includes('signin')) {
                      this.pageTitle = 'Sign In';
                    } else {
                      if (this.router.url.includes('register')) {
                        this.pageTitle = 'Register';
                      } else {
                        if (this.router.url.includes('learn-more')) {
                          this.pageTitle = 'Learn More';
                        } else {
                          if (this.router.url.includes('profile')) {
                            this.pageTitle = this.translate.instant('profile.component.header');
                          } else {
                            if (this.router.url.includes('')) {
                              this.pageTitle = 'RV Like Me';
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
