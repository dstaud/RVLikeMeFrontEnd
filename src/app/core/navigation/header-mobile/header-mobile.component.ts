import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouteConfigLoadEnd } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { SigninButtonVisibleService } from '@services/signin-btn-visibility.service';
import { RegisterBtnVisibleService } from '@services/register-btn-visiblity.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DeviceService } from '@services/device.service';
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
  signinVisible = true;
  registerVisible = false;
  showSpinner = false;
  showBackArrow = false;
  arrowIcon = 'arrow_back';
  returnRoute = '';
  autoRoute = false;
  device: string;
  lightTheme = true;

  constructor(private translate: TranslateService,
              private router: Router,
              private deviceSvc: DeviceService,
              private themeSvc: ThemeService,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              private registerBtnVisibleSvc: RegisterBtnVisibleService,
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

    // Listen for changes that determine whether to display 'Signin' or 'Sign up for free' which depend on context of what user is viewing
    this.signinBtnVisibleSvc.signinButtonVisible$
      .pipe(untilComponentDestroyed(this))
      .subscribe(data => {
        this.signinVisible = data.valueOf();
    });

    this.registerBtnVisibleSvc.registerButtonVisible$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.registerVisible = data.valueOf();
    });

    // If user leaves the page but returns (back on browser, bookmark), and auth token is still valid, return to state
    if (this.authSvc.isLoggedIn()) {
      this.authSvc.setUserToAuthorized(true);
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
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
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
    this.router.navigateByUrl('/');
  }


  register() {
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
    this.registerBtnVisibleSvc.toggleRegisterButtonVisible(false);
  }


  returnToBackRoute() {
    if (this.returnRoute === '') {
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
      this.registerBtnVisibleSvc.toggleRegisterButtonVisible(false);
    }
    if (this.returnRoute === 'landing-page') {
      this.router.navigateByUrl('/');
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
      this.registerBtnVisibleSvc.toggleRegisterButtonVisible(false);
    } else {
      this.router.navigateByUrl('/' + this.returnRoute);
    }
    this.activateBackArrowSvc.setBackRoute('');
  }

  selectTheme(theme: string) {
    this.lightTheme = !this.lightTheme;

    this.themeSvc.setGlobalColorTheme(theme);
  }

  signIn() {
    this.router.navigateByUrl('/signin');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }
}
