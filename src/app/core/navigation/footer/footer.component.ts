import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { DeviceService } from '@services/device.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { StandaloneService } from '@services/standalone.service';

@Component({
  selector: 'app-rvlm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  iPhoneXPlus = false;
  lightTheme = true;
  userProfile: Observable<IuserProfile>;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private deviceSvc: DeviceService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private profileSvc: ProfileService,
              private sentry: SentryMonitorService,
              private standaloneSvc: StandaloneService,
              private router: Router) {
                if (this.standaloneSvc.standalone) {
                  this.iPhoneXPlus = this.deviceSvc.iPhoneModelXPlus;
                }
               }

  ngOnInit() {
    this.listenForUserProfile();
  }

  ngOnDestroy() {}

  onRoute() {
    this.activateBackArrowSvc.setBackRoute('', 'nostack');
  }

  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      if (data.colorThemePreference === 'light-theme') {
        this.lightTheme = true;
      } else {
        this.lightTheme = false;
      }
    }, (error) => {
      this.sentry.logError('FooterComponent:listenForUserProfile: error listening for profile=' + JSON.stringify(error))
    });
  }
}
