import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { ThemeService } from '@services/theme.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-rvlm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  theme: string = 'light-theme';

  showSpinner: boolean = false;
  showInstallLink:boolean = false;
  profileID: string;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private event: any;

  constructor(private profileSvc: ProfileService,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private location: Location,
              private sentry: SentryMonitorService,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private themeSvc: ThemeService) {

  }

  ngOnInit(): void {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.showSpinner = true;

      this.listenBeforeInstall();

      this.listenForTheme();

      this.listenForUserProfile();
    }
  }

  ngOnDestroy() {}


  // If user chooses to install the app on their home screen
  onInstallApp() {
    // Show the install prompt
    this.event.prompt();

    // Wait for the user to respond to the prompt
    this.event.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  }


  // Toggle between light and dark theme as user selectes
  onSelectTheme(theme: string) {
    this.themeSvc.setGlobalColorTheme(theme);
    this.profile.colorThemePreference = theme;
    this.profileSvc.updateProfileAttribute(this.profile._id, 'colorThemePreference', this.profile.colorThemePreference)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      console.log('SettingsComponent:onSelectTheme: update color theme ', responseData);
    }, error => {
      this.sentry.logError({"message":"error listening for color theme","error":error});
    });
  }

  // Get the event handle when beforeInstallEvent fired that allows for app installation.
  // When fired, offer user option to install app from menu
  private listenBeforeInstall() {
    this.event = this.beforeInstallEventSvc.beforeInstallEvent$
    this.event
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      if (data !== null) {
        this.event = data.valueOf();
        this.showInstallLink = true;
      }
    });
  }


  // Listen for user profile and save
  private listenForTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(theme => {
      console.log('SettingsComponent:listenForTheme: got theme=', theme);
      this.theme = theme;
    }, error => {
      this.sentry.logError({"message":"error listening for color theme","error":error});
      this.theme = 'light-theme';
    });
  }


  // Listen for user profile and save
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      this.profileID = profile._id;
      this.showSpinner = false;
    }, error => {
      console.error('SettingsComponent:listenForUserProfile: error getting profile ', error);
      this.showSpinner = false;
      throw new Error(error);
    });
  }
}
