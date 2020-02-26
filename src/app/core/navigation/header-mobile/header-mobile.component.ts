import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouteConfigLoadEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { DeviceService } from '@services/device.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-rvlm-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {
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

  // Interface for profile data
  profile: IuserProfile = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: 'en',
    colorThemePreference: 'light-theme',
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null,
    rigType: null,
    rigManufacturer: null,
    rigBrand: null,
    rigModel: null,
    rigYear: null,
  };

  userProfile: Observable<IuserProfile>;

  constructor(private translate: TranslateService,
              private router: Router,
              private deviceSvc: DeviceService,
              private themeSvc: ThemeService,
              private profileSvc: ProfileService,
              private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService) { }

  ngOnInit() {
    this.router.events
    .pipe(untilComponentDestroyed(this))
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.setTitleOnRouteChange();
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

    this.device = this.deviceSvc.device;

    if (this.device === 'iPhone') {
      // arrow_back_ios icon not coming up at all regardless of this if
      this.arrowIcon = 'arrow_back_ios';
      // this.arrowIcon = 'keyboard_arrow_left';
    }

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
      });
  }

  ngOnDestroy() {}

  setTitleOnRouteChange(): void {
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


  changeUsername() {
    this.router.navigateByUrl('/credentials');
    this.activateBackArrowSvc.setBackRoute('/home');
  }


  logout() {
    this.authSvc.logout();
    this.authSvc.setUserToAuthorized(false);
    this.headerVisibleSvc.toggleHeaderVisible(false);
    this.router.navigateByUrl('/');
  }


  register() {
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }


  returnToBackRoute() {
    if (this.returnRoute === 'landing-page') {
      this.headerVisibleSvc.toggleHeaderVisible(false);
      this.router.navigateByUrl('/');
    } else {
      this.router.navigateByUrl('/' + this.returnRoute);
    }
    this.activateBackArrowSvc.setBackRoute('');
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

  signIn() {
    this.router.navigateByUrl('/signin');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }
}
