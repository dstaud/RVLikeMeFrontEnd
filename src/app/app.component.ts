import { Component, OnInit, OnDestroy} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, RouterOutlet } from '@angular/router';
import { Event as NavigationEvent } from '@angular/router';
import { NavigationStart } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { filter } from 'rxjs/operators';

import { environment } from '@environments/environment';

import { DeviceService } from '@services/device.service';
import { LanguageService } from '@services/language.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ThemeService } from '@services/theme.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { LikemeCountsService } from '@services/data-services/likeme-counts.service';
import { MessagesService, Iconversation, Imessage } from '@services/data-services/messages.service';
import { NewMessageCountService } from '@services/new-msg-count.service';
import { UserTypeService } from './core/services/user-type.service';
import { AdminService } from '@services/data-services/admin.service';
import { UsingEmailService } from './core/services/using-email.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { fadeAnimation } from './shared/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DeviceService],
  animations: [fadeAnimation]
})

export class AppComponent implements OnInit {

  readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;

  notificationPermission: string;
  theme: string;
  font: string;
  userAuthorized: boolean = false;
  headerVisible: boolean = false;
  headerDesktopVisible: boolean = false;
  iphoneModelxPlus: boolean;
  newMessageCount: number;

  private windowWidth: number;
  private userID: string;
  private userProfile: Observable<IuserProfile>;
  private userConversations: Observable<Iconversation[]>;

  constructor(public translate: TranslateService,
              private deviceSvc: DeviceService,
              private themeSvc: ThemeService,
              private language: LanguageService,
              private headerVisibleSvc: HeaderVisibleService,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService,
              private messagesSvc: MessagesService,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private newMsgCountSvc: NewMessageCountService,
              private userTypeSvc: UserTypeService,
              private UsingEmailSvc: UsingEmailService,
              private adminSvc: AdminService,
              private sentry: SentryMonitorService,
              private swUpdate: SwUpdate,
              private router: Router) {
    this.deviceSvc.determineGlobalFontTheme(); // Determine font based on device type for more natural app-like experience'
    this.deviceSvc.getDeviceInfo();

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
            this.router.navigateByUrl('/home/dashboard');
          } else {
          }
        }
      }
    );
  }

  ngOnInit() {
    this.listenForUpdatedVersionOfApp();

    this.listenForChangeInFontTheme();

    this.listenForChangeInColorTheme();

    this.listenForChangeInUserAuth();

    this.listenForChangeInHeaderVisibility();

    this.returnToStateIfUserLoggedIn();

    this.listenForUserProfile();

    this.listenForUserConversationsForMessageCount();

    this.listenForInstallPrompts();

    this.getSystemConfiguration();

  };

  ngOnDestroy() {
    this.profileSvc.dispose();
  };


  // This is supposed to scroll to the top for new pages but pageYOffset is always 0.  I think because of my top and bottom toolbars and required margins.
  // TODO: make this work somehow because when going to connections or groups to other pages, they are scrolled and content is under toolbar at top.
  onActivate(event: any) {
    let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
            window.scrollTo(0, pos - 20); // how far to scroll on each step
        } else {
            window.clearInterval(scrollToTop);
        }
    }, 16);
  }


  prepareRoute(outlet: RouterOutlet) {
    return outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animationState'];
   }


  // Get system configuration variables
  private getSystemConfiguration() {
    this.adminSvc.getSystemData()
    .pipe(untilComponentDestroyed(this))
    .subscribe(systemResult => {
      if (systemResult.length > 0) {
        this.UsingEmailSvc.setUseEmail(systemResult[0].useEmail);
      }
    }, error => {
      this.sentry.logError('AppComponent:getSystemConfiguration: error='+ error);
    })
  }


  // Listen for changes in color theme;
  private listenForChangeInColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });
  }


  // Listen for changes in font theme;
  private listenForChangeInFontTheme() {
    this.themeSvc.defaultGlobalFontTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(fontData => {
      this.font = fontData.valueOf();
    });
  }

  // Listen for changes in whether should show header toolbar
  private listenForChangeInHeaderVisibility() {
    this.headerVisibleSvc.headerVisible$
    .pipe(untilComponentDestroyed(this))
    .subscribe(header => {
      this.headerVisible = header.valueOf();
    });

    this.headerVisibleSvc.headerDesktopVisible$
    .pipe(untilComponentDestroyed(this))
    .subscribe(header => {
      this.headerDesktopVisible = header.valueOf();
    });
  }


  // Listen for changes in user authorization state
  private listenForChangeInUserAuth() {
    this.authSvc.userAuth$
    .pipe(untilComponentDestroyed(this))
    .subscribe(authData => {
      this.userAuthorized = authData.valueOf();
    });
  }


  // Listen for events around web app installation
  private listenForInstallPrompts() {
    // Listen for Chrome event that indicates we can offer the user option to install the app
    window.addEventListener('beforeinstallprompt', (event) => {

      // Prevent the default Chrome mini-infobar from appearing on Android mobile
      event.preventDefault();

      // Save the event so it can be triggered later in another component
      this.beforeInstallEventSvc.saveBeforeInstallEvent(event);
    });

    // Listen for Chrome event that indicates the user installed the app
    window.addEventListener('appinstalled', (event) => {
      this.updateInstallInfoOnCredentials();
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
    this.iphoneModelxPlus = this.deviceSvc.iPhoneModelXPlus;
  }


  // Listen for updated version of web app
  private listenForUpdatedVersionOfApp() {
    if (this.swUpdate.isEnabled) { // Is service worker running?
      this.swUpdate.available.subscribe(() => {
        if (confirm('A new version of RVLikeMe is available. Would you like to update now?')) {
          window.location.reload();
        }
      })
    }
  }


  // Listen for conversations and if get valid conversations for this user, then initiate getting new message count and listen for that
  private listenForUserConversationsForMessageCount() {
    this.userConversations = this.messagesSvc.conversation$;
    this.userConversations
    .pipe(untilComponentDestroyed(this)) // had this commented out for some reason
    .subscribe(conversations => {
      if (conversations.length === 0) {
        this.newMessageCount = null;
      } else {
        this.newMsgCountSvc.getNewMessageCount(this.userID, conversations);
      }
    });

    this.newMsgCountSvc.newMessageCount$
    .pipe(untilComponentDestroyed(this))
    .subscribe(count => {
      if (count.valueOf() === 0) {
        this.newMessageCount = null;
      } else {
        this.newMessageCount = count.valueOf();
      }
    });
  }

  // Listen for user profile.  Once we have a real profile, take other actions like getting Like Me Counts and user conversations
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this)) // had this commented out for some reason
    .subscribe(profile => {
      if (profile._id) {
        this.language.setLanguage(profile.language);

        if (profile.colorThemePreference) {
          this.themeSvc.setGlobalColorTheme(profile.colorThemePreference);
        } else {
          this.themeSvc.setGlobalColorTheme('light-theme');
        }

        // If user has indicated they are an expert or newbie, this information is used throughout the app
        if (profile.aboutMe) {
          if (profile.aboutMe === 'experienced') {
            this.userTypeSvc.setUserType('expert');
          } else {
            this.userTypeSvc.setUserType('newbie');
          }
        } else {
          this.userTypeSvc.setUserType('newbie');
        }

        // When we have actual profile data from the database, then go get the counts that will be used on the home page
        this.likeMeCountsSvc.getLikeMeCountsPriority();
        this.likeMeCountsSvc.getGroupByCounts();
        this.userID = profile.userID;
        this.messagesSvc.getConversations();
      }
    }, (error) => {
      this.sentry.logError('AppComponent:listenForUserProfile: error listening for profile=' + error);
      this.language.setLanguage('en');
      this.themeSvc.setGlobalColorTheme('light-theme');
    });
  }


  // If user leaves the page but returns (back on browser, bookmark, entering url, etc.), and auth token is still valid, return to state
  private returnToStateIfUserLoggedIn() {
    if (this.authSvc.isLoggedIn()) {
      this.authSvc.setUserToAuthorized(true);
      this.profileSvc.getProfile();
    }
  }


  private updateInstallInfoOnCredentials() {
    this.authSvc.updateInstallFlag(true, this.deviceSvc.device)
    .subscribe(user => {

    }, error => {
      this.sentry.logError('InstallComponent:updateInstallInfoOnCredentials: error updating credentials=' + error);
    });
  }
}
