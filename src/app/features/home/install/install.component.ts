import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { BeforeInstallEventService } from '@services/before-install-event.service';
import { ProfileService } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';
import { AuthenticationService } from '@services/data-services/authentication.service';

import { SharedComponent } from '@shared/shared.component';

/*
Business Logic: For Android users, present the option for the user to install the app.   Three actions:
1: User clicks install and accepts prompt to install.  In this case, notify the parent component that user successfully installed.   Parent component uses this to stop showing the option for install.
2: User clicks install and does not accept prompt to install.  In this case, nothing should happen
3: User does not attempt to install and clicks Do Not Show.  In this case, notify parent so that parent can stop showing.

Two Places in the database are affected by this component
1: Credentials: Store user actions about installing (true/false) and the device they are using.
2: Profile: Store user action about Do Not Show.   Note that once the profile is changed, the parent is listening for this and do not show will go up the chain async.
*/
@Component({
  selector: 'app-rvlm-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {
  @Input('theme') theme: string;
  @Input('event') event: any;
  @Input('profileID') profileID: string;
  @Input('hideInstall') hideInstall: boolean;

  @Output() userInstalledEmit = new EventEmitter();

  form: FormGroup;
  disable: boolean = false;
  showSpinner: boolean = false;
  device: string;
  userInstalled: boolean = false;

  private userClickedDoNotShow: boolean = false;

  constructor(private beforeInstallEventSvc: BeforeInstallEventService,
              private shared: SharedComponent,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private sentry: SentryMonitorService,
              private deviceSvc: DeviceService,
              fb: FormBuilder) {
                this.form = fb.group({
                  hideInstall: new FormControl('')
                });
}

  ngOnInit(): void {
    this.device = this.deviceSvc.device;
  }


  onHideInstall() {
    this.disable = true;
    this.userInstalled = false;
    this.userClickedDoNotShow = true;

    this.updateInstallInfoOnCredentials()

  }


  // If user chooses to install the app on their home screen
  onInstallApp() {
    this.disable = true;

    // alert('install?'); //TESTING
    // this.userInstalled = false; //TESTING
    // this.updateInstallInfoOnCredentials(); //TESTING

    // Show the install prompt
    this.event.prompt();

    // Wait for the user to respond to the prompt
    this.event.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
        this.userInstalled = true;

        // Unfortunately, Android is firing a before install event of some sort AFTER install so my setting event to null above does not have effect
        // and cannot be used by parent component.   Maybe it's a bug that will be fixed.  But for now, have to tell the parent component
        // App was installed so it can hide this component.
        this.userInstalledEmit.emit(true);
      } else {
        this.userInstalled = false;
        this.updateInstallInfoOnCredentials();
      }
    });
  }


  // If user installed, let the parent component know so that it can stop showing this component
  // If user did not install and clicked Do Not Show, then update the profile, which will also notify the parent async
  private notifyUser() {
    let self = this;

    if (this.userClickedDoNotShow) {
      this.shared.openSnackBar('You can always install from Settings', 'message', 4000);
      setTimeout(function () {
        self.updateDoNotShowOnUserProfile();
      }, 2000);
    } else {
      this.disable = false;
    }
  }


  private updateDoNotShowOnUserProfile() {
    this.profileSvc.updateProfileAttribute(this.profileID, 'hideInstall', true)
    .subscribe(profileResult => {
      this.profileSvc.distributeProfileUpdate(profileResult);

    }, error => {
      console.error('InstallComponent:onHideInstall: error updating profile=', error);
      this.sentry.logError('Error hiding install option for ' + this.profileID);
    });
  }


  private updateInstallInfoOnCredentials() {
    this.authSvc.updateInstallFlag(this.userInstalled, this.device)
    .subscribe(user => {

      this.notifyUser();

    }, error => {
      console.error('InstallComponent:updateInstallInfoOnCredentials: error updating credentials=', error);
      this.sentry.logError('error updating install flag on credentials');

      this.notifyUser();
    });
  }
}
