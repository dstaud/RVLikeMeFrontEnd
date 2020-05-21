import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { ThemeService } from '@services/theme.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { LanguageService } from '@services/language.service';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-rvlm-settings',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger('helpInstallSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('helpInstallAppleSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})
export class MainComponent implements OnInit {
  form: FormGroup;
  theme: string = 'light-theme';
  showSpinner: boolean = false;
  showInstallLink:boolean = false;
  showLanguageSaveIcon: boolean = false;
  profileID: string;
  helpInstallOpen: string = 'out';
  helpInstallAppleOpen: string = 'out';
  installAppleDevice: boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private event: any;

  constructor(private profileSvc: ProfileService,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private location: Location,
              private language: LanguageService,
              private sentry: SentryMonitorService,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private themeSvc: ThemeService,
              private device: DeviceService,
              fb: FormBuilder) {
                this.form = fb.group({
                  language: ['en', Validators.required],
                  aboutMe: [''],
                  helpNewbies: ['false']
                });
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

      if (this.device.os.toLowerCase() === 'ios') {
        this.installAppleDevice = true;
      }
    }
  }

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }


  onHelpInstall() {
    this.helpInstallOpen = this.helpInstallOpen === 'out' ? 'in' : 'out';
  }


  onHelpInstallApple() {
    this.helpInstallAppleOpen = this.helpInstallAppleOpen === 'out' ? 'in' : 'out';
  }


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


  onInstallApple() {
    this.activateBackArrowSvc.setBackRoute('settings/main', 'forward');
    this.router.navigateByUrl('/settings/install');
  }

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


  onSetLanguage(language: string) {
    this.showLanguageSaveIcon = true;
    this.profile.language = this.form.controls.language.value;
    this.profileSvc.updateProfileAttribute(this.profile._id, 'language', this.profile.language)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showLanguageSaveIcon = false;
      this.language.setLanguage(language);
    }, error => {
      this.showLanguageSaveIcon = false;
      console.error('ProfileComponent:setLanguage: throw error ', error);
      throw new Error(error);
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


  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      this.profileID = profile._id;
      this.form.patchValue({language:profile.language});
      this.showSpinner = false;
    }, error => {
      console.error('SettingsComponent:listenForUserProfile: error getting profile ', error);
      this.showSpinner = false;
      throw new Error(error);
    });
  }
}
