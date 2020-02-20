import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router} from '@angular/router';
import { Event as NavigationEvent } from '@angular/router';
import { NavigationStart } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter } from 'rxjs/operators';

import { DeviceService } from '@services/device.service';
import { LanguageService } from '@services/language.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ThemeService } from '@services/theme.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { SigninButtonVisibleService } from '@services/signin-btn-visibility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DeviceService]
})

export class AppComponent implements OnInit {
  userAuthorized$: Observable<boolean>;
  theme: string;
  font: string;
  userAuthorized = false;
  userProfile: Observable<IuserProfile>;


  constructor(public translateSvc: TranslateService,
              private deviceSvc: DeviceService,
              private themeSvc: ThemeService,
              private language: LanguageService,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              private router: Router) {
    this.deviceSvc.determineGlobalFontTheme(); // Determine font based on device type for more natural app-like experience'
    this.router.events
    .pipe(
      filter(
          ( event: NavigationEvent ) => {
            return( event instanceof NavigationStart );
          }
      ),
      untilComponentDestroyed(this)
    )
    .subscribe(
      (event: NavigationStart ) => {
        // If user returns to the app through root URL, but their auth token is still valid, then send them to the home page.
        // No need to login again.  However, if auth but coming to the root page, route to home.
        if (this.authSvc.isLoggedIn()) {
          if (event.url === '/') {
            this.router.navigateByUrl('/home');
            // this.getPreferredLanguage();
          } else {
            // TODO: Race condition where title of page not set.
            // this.getPreferredLanguage();
          }
        }
      }
    );
  }

  ngOnInit() {
     // Listen for changes in font theme;
    this.themeSvc.defaultGlobalFontTheme
      .pipe(untilComponentDestroyed(this))
      .subscribe(fontData => {
        this.font = fontData.valueOf();
        console.log('Font=', this.font);
      });

    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
      .pipe(untilComponentDestroyed(this))
      .subscribe(themeData => {
        this.theme = themeData.valueOf();
        console.log('Theme=', this.theme);
      });

    // Listen for changes in user authorization state
    this.authSvc.userAuth$
      .pipe(untilComponentDestroyed(this))
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });

    // If user leaves the page but returns (back on browser, bookmark, entering url, etc.), and auth token is still valid, return to state
    if (this.authSvc.isLoggedIn()) {
      // Get user profile
      this.userProfile = this.profileSvc.profile;
      this.profileSvc.getProfile();

      this.userProfile
      .pipe(untilComponentDestroyed(this))
      .subscribe(data => {
        console.log('in app component=', data);
        if (data.language) {
          this.language.setLanguage(data.language);
        } else {
          this.language.setLanguage('en');
        }
      }, (error) => {
        console.error(error);
        this.language.setLanguage('en');
      });

      this.authSvc.setUserToAuthorized(true);
      this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    }
  };

  ngOnDestroy() {
    this.profileSvc.dispose();
  };
}
