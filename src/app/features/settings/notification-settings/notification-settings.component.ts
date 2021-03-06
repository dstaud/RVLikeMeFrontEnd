import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SwUpdate, SwPush } from '@angular/service-worker';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { environment } from '@environments/environment';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SubscribeNotificationsService } from '@services/data-services/subscribe-notifications.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
  providers: [SubscribeNotificationsService]
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
              private authSvc: AuthenticationService,
              private swUpdate: SwUpdate,
              private swPush: SwPush,
              private shared: SharedComponent,
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
    this.subscribeNotificationsSvc.sendNotificationTest(this.profile.notifySubscription)
    .pipe(untilComponentDestroyed(this))
    .subscribe(notifyResult => {
      this.showSpinner = false;
    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    })
  }


  // Subscribe to push notifications
  onSubscribeNotifications() {
    if (this.swUpdate.isEnabled) {
      this.showSpinner = true;
      this.swPush.requestSubscription({
        serverPublicKey: environment.vapidPublicKey
      })
      .then(subscription => {
        this.subscribeNotificationsSvc.subscribeToNotifications(this.profileID, subscription)
        .pipe(untilComponentDestroyed(this))
        .subscribe(subscribeResults => {
          this.showSpinner = false;
        }, error => {
          this.shared.notifyUserMajorError(error);
          throw new Error(JSON.stringify(error));
        })
      })
      .catch(err => this.sentry.logError("Could not subscribe to notifications" + err));
    }
  }


  onSubmit() {

  }


  // Unsubscribe from push notifications
  onUnsubscribeNotifications() {
    this.showSpinner = true;
    this.subscribeNotificationsSvc.unsubscribeFromNotifications(this.profileID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(unsubscribeResults => {
      this.showSpinner = false;
    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
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
      this.profileSvc.distributeProfileUpdate(responseData);
      this.showsendMessageNotificationEmailsSaveIcon = false;
    }, error => {
      this.showsendMessageNotificationEmailsSaveIcon = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }


  // For now, not releasing push notifications to users, but want to be able to test myself so only turning on for me
  private listenForAdmin() {
    this.authSvc.getUser()
    .subscribe(user => {
      this.authSvc.getDaveInfo()
      .pipe(untilComponentDestroyed(this))
      .subscribe(daveInfo => {
        if (user.email === daveInfo.email) {
          this.showPushNotifications = true;
        }
      }, error => {
        this.sentry.logError(JSON.stringify({"message":"Error getting Dave Info","error":error}));
      });
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"Error getting user Info","error":error}));
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
    }, error => {
      this.sentry.logError('SettingsComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
    });
  }
}
