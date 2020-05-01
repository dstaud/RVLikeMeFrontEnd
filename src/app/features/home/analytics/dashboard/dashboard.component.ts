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

@Component({
  selector: 'app-rvlm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  newbie: boolean = false;
  experiencedHelp: boolean = false;
  theme: string = 'light-theme';

  private backPath = '';
  private userProfile: Observable<IuserProfile>;
  private profile: IuserProfile;

  constructor(public translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private shareDataSvc: ShareDataService,
              private themeSvc: ThemeService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit() {
    console.log('IN DASHBOARD, NOT HOME')
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.listenForColorTheme();

    this.listenForUserProfile();
  }

  ngOnDestroy() {}


  onHelpNewbieTopic() {
    this.activateBackArrowSvc.setBackRoute('home/dashboard');
    this.router.navigateByUrl('/newbie/help-newbie');
  }


  onNewbieTopics() {
    let params = '{"displayName":"' + this.profile.displayName + '","profileImageUrl":"' + this.profile.profileImageUrl + '"}'
    this.shareDataSvc.setData(params);
    this.activateBackArrowSvc.setBackRoute('home/dashboard');
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
      console.error('HomeComponent:listenForUserProfile: error getting profile ', error);
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
      console.error(error);
    });
  }
}
