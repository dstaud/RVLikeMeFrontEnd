import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService, Idashboard } from '@services/share-data.service';
import { ThemeService } from '@services/theme.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';

@Component({
  selector: 'app-rvlm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  newbie: boolean = false;
  experiencedHelp: boolean = false;
  theme: string = 'light-theme';
  showInstallComponent: boolean = false;
  event: any;
  profile: IuserProfile;
  hideInstall: boolean = false;
  iPhoneModelxPlus: boolean = false;

  private userProfile: Observable<IuserProfile>;
  private dashboardInfo: Idashboard
  private desktopUser: boolean = false;

  constructor(public translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private shareDataSvc: ShareDataService,
              private themeSvc: ThemeService,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private device: DeviceService,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private router: Router) {
          this.iPhoneModelxPlus = this.device.iPhoneModelXPlus;
  }

  ngOnInit() {
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
      if (window.innerWidth > 600) {
        this.desktopUser = true;
      }

      this.listenBeforeInstall();

      this.dashboardInfo = this.shareDataSvc.getData('dashboard'); // not yet using this.  Problem is, if they are using as app, won't log in a lot.  But may be useful

      this.listenForColorTheme();

      this.listenForUserProfile();
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


  onHelpNewbieTopic() {
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
    if (this.desktopUser) {
      this.router.navigateByUrl('/newbie/main');
    } else {
      this.router.navigateByUrl('/newbie/newbie-corner');
    }
  }


  onNewbieTopics() {
    // let params:InewbieHelp = {
    //   displayName: this.profile.displayName,
    //   profileImageUrl: this.profile.profileImageUrl
    // }

    // this.shareDataSvc.setData('newbieHelp', params);
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
    if (this.desktopUser) {
      this.router.navigateByUrl('/newbie/main');
    } else {
      this.router.navigateByUrl('/newbie/newbie-corner');
    }

  }


  // I have to do this crazy two-level boolean because Android is sending back an before install event AFTER the user installs, so can't count on that.
  // So, intially both showInstallComponent and hideInstall are false.  If I get a beforeInstallEvent, set showInstallCOmponent to true which makes the component show
  // But if they install, set hideInstall to true which makes the component hide regardless of showInstallComponent.
  hideInstallComponent() {
    this.showInstallComponent = false;
    this.hideInstall = true;
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
        this.showInstallComponent = true;
      } else {
        this.showInstallComponent = false;
      }
    });
  }


  // Get user profile
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      if (this.profile.aboutMe === 'newbie' || this.profile.aboutMe === 'dreamer') {
        this.newbie = true;
      } else if (this.profile.aboutMe === 'experienced' && this.profile.helpNewbies) {
        this.experiencedHelp = true;
      } else {
        this.experiencedHelp = false;
      }

      if (this.profile.hideInstall) {
        this.hideInstall = true;
      } else {
        this.hideInstall = false;
      }

    }, (error) => {
      this.sentry.logError('HomeDashboardComponent:listenForUserProfile: error getting profile ' + JSON.stringify(error));
    });
  }

  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"unable to listen for color theme","error":error}));
    });
  }
}
