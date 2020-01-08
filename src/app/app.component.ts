import { SigninVisibilityService } from './core/services/signin-visibility.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd} from '@angular/router';
import { DeviceService } from './core/services/device.service';
import { ThemeService } from './core/services/theme.service';
import { AuthenticationService } from './core/services/data-services/authentication.service';
import { Event as NavigationEvent } from '@angular/router';
import { NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DeviceService]
})

export class AppComponent implements OnInit {
  globalFontTheme: Observable<string>;
  globalColorTheme: Observable<string>;
  userAuthorized$: Observable<boolean>;
  theme: string;
  font: string;
  userAuthorized = false;


  constructor(public translateService: TranslateService,
              private deviceService: DeviceService,
              private themeService: ThemeService,
              private auth: AuthenticationService,
              private signInVisible: SigninVisibilityService,
              private router: Router) {
    translateService.setDefaultLang('en'); // Default to US English
    this.deviceService.determineGlobalFontTheme(); // Determine font based on device type for more natural app-like experience'
    this.router.events
    .pipe(
      filter(
          ( event: NavigationEvent ) => {
            return( event instanceof NavigationStart );
          }
      )
    )
    .subscribe(
      (event: NavigationStart ) => {
        console.group('NavigationStart Event');
        // Every navigation sequence is given a unique ID. Even "popstate"
        // navigations are really just "roll forward" navigations that get
        // a new, unique ID.
        console.log('navigation id:', event.id);
        console.log('route:', event.url);

        // The "navigationTrigger" will be one of:
        // --
        // - imperative (ie, user clicked a link).
        // - popstate (ie, browser controlled change such as Back button).
        // - hashchange
        // --
        // NOTE: I am not sure what triggers the "hashchange" type.
        console.log('trigger:', event.navigationTrigger);

        // This "restoredState" property is defined when the navigation
        // event is triggered by a "popstate" event (ex, back / forward
        // buttons). It will contain the ID of the earlier navigation event
        // to which the browser is returning.
        // --
        // CAUTION: This ID may not be part of the current page rendering.
        // This value is pulled out of the browser; and, may exist across
        // page refreshes.
        if (event.restoredState) {
          console.warn('restoring navigation id:', event.restoredState.navigationId);
        }
        console.groupEnd();

        // If user returns to the app through root URL, but their auth token is still valid, then send them to the home page.
        // No need to login again.  However, if auth but coming to the root page, route to home.
        // This messing up logout which routes to '/' and causes a race condition where still logged in when get here so routes to home.
        if (event.url === '/' && this.auth.isLoggedIn()) {
          console.log('in app component, routing to home');
          this.router.navigateByUrl('/home');
        }
      }
    );
  }

  ngOnInit() {
    // Listen for changes in font theme;
    this.themeService.defaultGlobalFontTheme
      .subscribe(fontData => {
        this.font = fontData.valueOf();
        console.log('Font=', this.font);
      });

    // Listen for changes in color theme;
    this.themeService.defaultGlobalColorTheme
      .subscribe(themeData => {
        this.theme = themeData.valueOf();
        console.log('Theme=', this.theme);
      });

    // Listen for changes in user authorization state
    this.auth.userAuth$
      .subscribe(authData => {
        this.userAuthorized = authData.valueOf();
      });

    // If user leaves the page but returns (back on browser, bookmark, entering url, etc.), and auth token is still valid, return to state
    if (this.auth.isLoggedIn()) {
      this.auth.setUserToAuthorized(true);
      this.signInVisible.toggleSignin(false);
    }
  }
}
