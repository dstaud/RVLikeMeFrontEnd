import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SwUpdate, SwPush } from '@angular/service-worker';

import { Observable, Subscription } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SubscribeNotificationsService } from '@services/data-services/subscribe-notifications.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { environment } from '@environments/environment';

@Component({
  selector: 'app-rvlm-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  form: FormGroup;

  showSpinner: boolean = false;
  showsendMessageNotificationEmailsSaveIcon: boolean = false;
  showPushNotifications: boolean = false;

  private profileID: string;
  private sendMessageEmails: boolean;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private router: Router,
              private location: Location,
              private swUpdate: SwUpdate,
              private swPush: SwPush,
              private sentry: SentryMonitorService,
              private subscribeNotificationsSvc: SubscribeNotificationsService,
              fb: FormBuilder) {
              this.form = fb.group({
                sendMessageNotificationEmails: new FormControl('')
              });

              this.listenForAdmin();
}

  ngOnInit(): void {
    this.listenForUserProfile();
  }

  ngOnDestroy() {}


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


  onSubmit() {

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


  // Update profile on server when user checks an interest
  onUpdateSendMessageEmails(event: any) {
    let sendMessageEmails: boolean

    this.showsendMessageNotificationEmailsSaveIcon = true;
    sendMessageEmails = event.checked;
    this.profileSvc.updateProfileAttribute(this.profileID, 'sendMessageEmails', sendMessageEmails)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showsendMessageNotificationEmailsSaveIcon = false;
    }, error => {
      this.showsendMessageNotificationEmailsSaveIcon = false;
      console.error('NotificationSettingsComponent:updateSendMessageEmails: throw error ', error);
      throw new Error(error);
    });
  }


  // For now, not releasing push notifications to users, but want to be able to test myself so only turning on for me
  private listenForAdmin() {
    this.authSvc.getUser()
    .subscribe(user => {
      this.authSvc.getDaveInfo()
      .subscribe(daveInfo => {
        console.log('NotificationSettingsComponent:listenForAdmin: useremail=', user.email, ' daveemail=', daveInfo);
        if (user.email === daveInfo.email) {
          this.showPushNotifications = true;
        }
      }, error => {
        this.sentry.logError({"message":"Error getting Dave Info","error":error});
      });
    }, error => {
      this.sentry.logError({"message":"Error getting user Info","error":error});
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
      this.sendMessageEmails = profile.sendMessageEmails;
      this.form.patchValue({
        sendMessageNotificationEmails: this.sendMessageEmails
      })
      console.log('SettingsComponent:listenForUserProfile: sendMessageEmails=', profile.sendMessageEmails);
    }, error => {
      console.error('SettingsComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }
}
