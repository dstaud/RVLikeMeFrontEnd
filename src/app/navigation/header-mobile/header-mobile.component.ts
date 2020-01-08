import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SigninDialogComponent } from './../../features/register-signin/signin-dialog/signin-dialog.component';
import { SigninVisibilityService } from './../../core/services/signin-visibility.service';
import { RegisterTriggeredService } from './../../core/services/register-triggered.service';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {
  pageTitle: string;
  userAuthorized$: Observable<boolean>;
  userAuthorized = false;
  signinVisible = true;

  constructor(private translateService: TranslateService,
              private router: Router,
              private signInDialog: MatDialog,
              private signinVisibilityService: SigninVisibilityService,
              private registerTriggeredService: RegisterTriggeredService,
              private auth: AuthenticationService) {
  }

  ngOnInit() {
    this.router.events
    .subscribe({
      next: (event) => {
        if (event instanceof NavigationEnd) {
          this.setTitleOnRouteChange();
        }
      }
    });

    // Listen for changes in user authorization state
    this.auth.userAuth$
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });

    // Listen for changes that determine whether to display 'Signin' or 'Sign up for free' which depend on context of what user is viewing
    this.signinVisibilityService.signinVisible$
      .subscribe(data => {
        this.signinVisible = data.valueOf();
    });

    // If user leaves the page but returns (back on browser, bookmark), and auth token is still valid, return to state
    if (this.auth.isLoggedIn()) {
      this.auth.setUserToAuthorized(true);
      this.signinVisibilityService.toggleSignin(false);
    }
  }

  setTitleOnRouteChange(): void {
    console.log('in title route change');
    if (this.router.url.includes('home')) {
     this.pageTitle = this.translateService.instant('home.component.header');
     console.log('page title=', this.pageTitle);
    } else {
      if (this.router.url.includes('forums')) {
        this.pageTitle = this.translateService.instant('forums.component.header');
      } else {
        if (this.router.url.includes('messages')) {
          this.pageTitle = this.translateService.instant('messages.component.header');
        } else {
          if (this.router.url.includes('connections')) {
            this.pageTitle = this.translateService.instant('connections.component.header');
          } else {
            if (this.router.url.includes('settings')) {
              this.pageTitle = this.translateService.instant('settings.component.header');
            } else {
              if (this.router.url.includes('about')) {
                this.pageTitle = this.translateService.instant('about.component.header');
              } else {
                if (this.router.url.includes('profile')) {
                  this.pageTitle = this.translateService.instant('profile.component.header');
                } else {
                  if (this.router.url.includes('')) {
                    this.pageTitle = this.translateService.instant('landing-page.component.header');
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

    const signinConfig = new MatDialogConfig();

    signinConfig.autoFocus = true;
    signinConfig.position = {
      top: '20px'
    };
    signinConfig.ariaLabel = 'Sign In Dialog';
    signinConfig.hasBackdrop = false;
    // signinConfig.backdropClass = 'backdropBackground';
    signinConfig.disableClose = true;

    const dialogRef = this.signInDialog.open(SigninDialogComponent, signinConfig);


    // After dialog is closed, if valid token exists, user is logged in so navigate to home page.
    dialogRef.afterClosed().subscribe(result => {
      if (this.auth.isLoggedIn()) {
        this.auth.setUserToAuthorized(true);
        this.router.navigateByUrl('/home');
      }
    });
  }

    register() {
      this.registerTriggeredService.showRegisterDialog(true);
    }
}
