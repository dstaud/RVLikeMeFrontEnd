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
import { HeaderVisibleService } from '@services/header-visibility.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';

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
  headerVisible = false;
  userProfile: Observable<IuserProfile>;


  constructor(public translateSvc: TranslateService,
              private deviceSvc: DeviceService,
              private themeSvc: ThemeService,
              private language: LanguageService,
              private headerVisibleSvc: HeaderVisibleService,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private beforeInstallEventSvc: BeforeInstallEventService,
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

    // Listen for changes in whether should show header toolbar
    this.headerVisibleSvc.headerVisible$
      .pipe(untilComponentDestroyed(this))
      .subscribe(header => {
        this.headerVisible = header.valueOf();
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
        if (data.colorThemePreference) {
          this.themeSvc.setGlobalColorTheme(data.colorThemePreference);
        } else {
          this.themeSvc.setGlobalColorTheme('light-theme');
        }
      }, (error) => {
        console.error(error);
        this.language.setLanguage('en');
        this.themeSvc.setGlobalColorTheme('light-theme');
      });

      this.authSvc.setUserToAuthorized(true);
    }

    // Listen for Chrome event that indicates we can offer the user option to install the app
    window.addEventListener('beforeinstallprompt', (event) => {

      // Prevent the default Chrome mini-infobar from appearing on Android mobile
      event.preventDefault();

      // Save the event so it can be triggered later in another component
      this.beforeInstallEventSvc.saveBeforeInstallEvent(event);
    });

    // Listen for Chrome event that indicates the user installed the app
    window.addEventListener('appinstalled', (event) => {
      console.log('app installed!'); //TODO: Get this information in Google Analytics somehow
    });

    // Determine if user has installed the app previously
    let navigator: any;
    navigator = window.navigator;
    window.addEventListener('load', () => {
      if (navigator.standalone) {
        console.log('Launched: Installed (iOS)');
      } else if (matchMedia('(display-mode: standalone)').matches) {
        console.log('Launched: Installed');
      } else {
        console.log('Launched: Browser Tab');
      }
    });
  };

  ngOnDestroy() {
    console.log('dispose from app');
    this.profileSvc.dispose();
  };
}
