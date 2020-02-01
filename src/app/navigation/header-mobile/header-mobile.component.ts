import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, NavigationEnd} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';
import { RegisterBtnVisibleService } from './../../core/services/register-btn-visiblity.service';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';
import { DeviceService } from './../../core/services/device.service';

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

  constructor(private translate: TranslateService,
              private router: Router,
              private deviceSvc: DeviceService,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              private registerBtnVisibleSvc: RegisterBtnVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService) { }

  ngOnInit() {
    this.router.events
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.setTitleOnRouteChange();
        }
      }
    });

    if (this.deviceSvc.device === 'iPhone') {
      // This icon not coming up at all regardless of this if
      this.arrowIcon = 'arrow_back_ios';
    }

    // Listen for changes in user authorization state
    this.authSvc.userAuth$
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });

    // Listen for changes that determine whether to display 'Signin' or 'Sign up for free' which depend on context of what user is viewing
    this.signinBtnVisibleSvc.signinButtonVisible$
      .subscribe(data => {
        this.signinVisible = data.valueOf();
    });

    this.registerBtnVisibleSvc.registerButtonVisible$
    .subscribe(data => {
      this.registerVisible = data.valueOf();
    });

    // If user leaves the page but returns (back on browser, bookmark), and auth token is still valid, return to state
    if (this.authSvc.isLoggedIn()) {
      this.authSvc.setUserToAuthorized(true);
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    }

    this.activateBackArrowSvc.route$
      .subscribe(data => {
        this.returnRoute = data.valueOf();
        if (this.returnRoute) {
          if (this.returnRoute.substring(0, 1) === '*') {
              this.returnRoute = this.returnRoute.substring(1, this.returnRoute.length);
              console.log('auto route=', this.returnRoute);
              this.autoRoute = true;
              this.showBackArrow = false;
            } else {
              console.log('Return Route Changed to ', this.returnRoute);
              this.showBackArrow = true;
            }
          } else {
              this.showBackArrow = false;
              this.autoRoute = false;
          }
      });
  }

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
            if (this.router.url.includes('settings')) {
              this.pageTitle = this.translate.instant('settings.component.header');
            } else {
              if (this.router.url.includes('about')) {
                this.pageTitle = this.translate.instant('about.component.header');
              } else {
                if (this.router.url.includes('profile-personal')) {
                  this.pageTitle = 'Profile - Personal';
                } else {
                  if (this.router.url.includes('profile-lifestyle')) {
                    this.pageTitle = 'Profil - Lifestyle';
                  } else {
                    if (this.router.url.includes('profile-rig')) {
                      this.pageTitle = 'Profile - Rig';
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

  signIn() {
    this.router.navigateByUrl('/signin');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

  manageCredentials() {
    this.router.navigateByUrl('/credentials');
    this.activateBackArrowSvc.setBackRoute('/home');
  }

  returnToBackRoute() {
    console.log('Back To Route=', this.returnRoute);
    if (this.returnRoute === '') {
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
      this.registerBtnVisibleSvc.toggleRegisterButtonVisible(false);
    }
    console.log('navigating to ', this.returnRoute);
    if (this.returnRoute === 'landing-page') {
      this.router.navigateByUrl('/');
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
      this.registerBtnVisibleSvc.toggleRegisterButtonVisible(false);
    } else {
      this.router.navigateByUrl('/' + this.returnRoute);
    }
    this.activateBackArrowSvc.setBackRoute('');
  }

  register() {
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
    this.registerBtnVisibleSvc.toggleRegisterButtonVisible(false);
  }
}
