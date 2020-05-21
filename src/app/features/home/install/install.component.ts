import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { BeforeInstallEventService } from '@services/before-install-event.service';
import { ProfileService } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { SharedComponent } from '@shared/shared.component';

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

  @Output() doNotShowInstall  = new EventEmitter();

  form: FormGroup;
  disable: boolean = false;
  showSpinner: boolean = false;

  constructor(private beforeInstallEventSvc: BeforeInstallEventService,
              private shared: SharedComponent,
              private profileSvc: ProfileService,
              private sentry: SentryMonitorService,
              fb: FormBuilder) {
                this.form = fb.group({
                  hideInstall: new FormControl('')
                });
}

  ngOnInit(): void {
  }


  onHideInstall() {
    let self = this;

    this.disable = true;
    this.showSpinner = true;

    this.profileSvc.updateProfileAttribute(this.profileID, 'hideInstall', true)
    .subscribe(profileResult => {
      this.showSpinner = false;
      this.shared.openSnackBar('You can always install from Settings', 'message', 4000);
    }, error => {
      console.error('InstallComponent:onHideInstall: error updating profile=', error);
      this.sentry.logError('Error hiding install option for ' + this.profileID);
      this.showSpinner = false;
      this.shared.openSnackBar('You can always install from Settings', 'message', 4000);
    });

    setTimeout(function () {
      self.doNotShowInstall.emit(true);
    }, 2000);

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
}
