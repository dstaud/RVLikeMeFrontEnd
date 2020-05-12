import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';
import { ThemeService } from '@services/theme.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-rvlm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  newbie: boolean = false;
  experiencedHelp: boolean = false;
  theme: string = 'light-theme';

  private userProfile: Observable<IuserProfile>;
  private profile: IuserProfile;

  constructor(public translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private shareDataSvc: ShareDataService,
              private themeSvc: ThemeService,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

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
      this.listenForColorTheme();

      this.listenForUserProfile();
    }
  }

  ngOnDestroy() {}


  onHelpNewbieTopic() {
    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
    this.router.navigateByUrl('/newbie/help-newbie');
  }


  onNewbieTopics() {
    let params = '{"displayName":"' + this.profile.displayName + '","profileImageUrl":"' + this.profile.profileImageUrl + '"}'
    this.shareDataSvc.setData(params);
    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
    this.router.navigateByUrl('/newbie/need-help-newbie');
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
    }, (error) => {
      console.error('HomeDashboardComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }

  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
      console.log('ForumsListComponent:ngOnInit: Theme=', this.theme);
    }, error => {
      this.sentry.logError({"message":"unable to listen for color theme","error":error});
    });
  }
}
