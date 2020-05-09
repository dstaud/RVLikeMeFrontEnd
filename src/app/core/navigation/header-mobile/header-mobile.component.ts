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
    this.activateBackArrowSvc.setBackRoute('/profile/main');
  }


  onChangeUsername() {
    this.router.navigateByUrl('/credentials');
    this.activateBackArrowSvc.setBackRoute('/home/dashboard');
  }


  onUpdateProfile() {
    this.router.navigateByUrl('/profile/main');
    this.activateBackArrowSvc.setBackRoute('home/dashboard');
  }


  onLogout() {
    this.authSvc.logout();
    this.profileSvc.dispose();
    this.authSvc.setUserToAuthorized(false);
    this.headerVisibleSvc.toggleHeaderVisible(false);
    this.router.navigateByUrl('/');
  }



  returnToBackRoute() {
    if (this.returnRoute === 'landing-page') {
      this.headerVisibleSvc.toggleHeaderVisible(false);
      this.router.navigateByUrl('/');
    } else {
      console.log('HeaderMobileComponent:returnToBackRoute: return route=', this.returnRoute);
      this.router.navigateByUrl('/' + this.returnRoute);
    }
    this.activateBackArrowSvc.setBackRoute('');
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
      console.error('HeaderMobileComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
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
    console.log('DEVICE=', this.device)

    if (this.device === 'iPhone') {
      // arrow_back_ios icon not coming up at all regardless of this if
      this.arrowIcon = 'arrow_back_ios';
      // this.arrowIcon = 'keyboard_arrow_left';
    }
  }


  private setReturnRoute() {
    this.activateBackArrowSvc.route$
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
    }, error => {
      console.error('HeaderMobileComponent:setReturnRoute: error setting return route ', error);
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
