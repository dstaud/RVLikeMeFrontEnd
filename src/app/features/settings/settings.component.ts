import { Component, OnInit, OnDestroy } from '@angular/core';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { SubscribeNotificationsService } from '@services/data-services/subscribe-notifications.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { ThemeService } from '@services/theme.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';

@Component({
  selector: 'app-rvlm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  lightTheme = true;

  showSpinner: boolean = false;
  showInstallLink:boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private profileID: string;
  private event: any;

  constructor(private swUpdate: SwUpdate,
              private swPush: SwPush,
              private profileSvc: ProfileService,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private location: Location,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private themeSvc: ThemeService,
              private subscribeNotificationsSvc: SubscribeNotificationsService) { }

  ngOnInit(): void {
    let backPath;

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/signin');
    }
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    this.listenBeforeInstall();

    this.listenForUserProfile();
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


  onNotify() {
    this.showSpinner = true;
    console.log('SideNavComponent:onNotify: in onNotify');
    console.log('SideNavComponent:onNotify: notify=', this.profile.notifySubscription);
    this.subscribeNotificationsSvc.sendNotificationTest(this.profile.notifySubscription)
    .subscribe(notifyResult => {
      console.log('onNotify: message should be on the way', notifyResult);
      this.showSpinner = false;
    }, error => {
      console.error('onNotify: throw error ', error);
      throw new Error(error);
    })
  }


  // Subscribe to push notifications
  onSubscribeNotifications() {
    console.log('onSubscribeNotifications: swUpdate enabled=', this.swUpdate.isEnabled);
    if (this.swUpdate.isEnabled) {
      this.showSpinner = true;
      console.log('onSubscribeNotifications: swUpdate is enabled. requesting sub with key=', environment.vapidPublicKey);
      this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey
      })
      .then(subscription => {
        console.log('onSubscribeNotifications: calling server with subscription ', subscription);
        this.subscribeNotificationsSvc.subscribeToNotifications(this.profileID, subscription)
        .subscribe(subscribeResults => {
          console.log('onSubscribeNotifications: received server response=', subscribeResults);
          this.showSpinner = false;
        }, error => {
          console.error('onSubscribeNotifications: throw error ', error);
          throw new Error(error);
        })
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
    }
  }


  // Unsubscribe from push notifications
  onUnsubscribeNotifications() {
    this.showSpinner = true;
    this.subscribeNotificationsSvc.unsubscribeFromNotifications(this.profileID)
    .subscribe(unsubscribeResults => {
      console.log('onSubscribeNotifications: received server response=', unsubscribeResults);
      this.showSpinner = false;
    }, error => {
      console.error('onSubscribeNotifications: throw error ', error);
      throw new Error(error);
    });
  }


  // Toggle between light and dark theme as user selectes
  onSelectTheme(theme: string) {
    this.lightTheme = !this.lightTheme;

    this.themeSvc.setGlobalColorTheme(theme);
    this.profile.colorThemePreference = theme;
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      console.log('SettingsComponent:onSelectTheme: update color theme ', responseData);
    }, error => {
      console.log('HeaderMobileComponent:selectTheme: throw error ', error);
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


  // Listen for user profile and save
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      this.profileID = profile._id;
    }, error => {
      console.error('SettingsComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }
}
