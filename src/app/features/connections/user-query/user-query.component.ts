import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LikemeCountsService } from '@services/data-services/likeme-counts.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService, IforumsMain, IuserQuery } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-user-query',
  templateUrl: './user-query.component.html',
  styleUrls: ['./user-query.component.scss']
})
export class UserQueryComponent implements OnInit {
  showSpinner: boolean = false;
  showAllMatches: boolean = false;
  showQueryResults: boolean = false;
  showSingleMatchForumOffer: boolean = true;
  showMultiMatchQuery: boolean = false;
  showQueryCancel: boolean = false;
  showNoConnections: boolean = false;
  disableSingleMatchForumOffer: boolean = true;
  queryMatches: boolean = false;
  matches: Array<IuserQuery> = [];
  queryResultMessagePrefix: string;
  matchResults = [];
  theme: string;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private desktopUser: boolean = false;

  constructor(private translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private likeMeCountsSvc: LikemeCountsService,
              private router: Router,
              private shareDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private shared: SharedComponent,
              private device: DeviceService,
              private themeSvc: ThemeService) { }

  ngOnInit() {
    let sharedData: any;
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

      this.showSpinner = true;

      if (this.shareDataSvc.getData('userQuery').length > 0) {
          this.matches = this.shareDataSvc.getData('userQuery');

          this.listenForColorTheme();

          this.getQueryResults();

          this.listenForUserProfile();
      } else {
        this.router.navigateByUrl('/connections/main');
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


  // If user selects cancel
  onCancel() {
    this.router.navigateByUrl('connections/main');
  }


  // When user selects the forum group, save the parameters in a shared data service
  onSelectForumGroup() {
    let name: string;
    let value: any;
    let queryParams:IforumsMain = {
      forumType: 'group'
    }

    this.matches.forEach((item: IuserQuery) => {
      name = Object.keys(item)[0];
      value = Object.values(item)[0];

      queryParams[name] = value;
    });

    this.shareDataSvc.setData('forumsMain', queryParams);
    this.activateBackArrowSvc.setBackRoute('connections/user-query', 'forward');

    if (this.desktopUser) {
      this.router.navigateByUrl('/forums/main');
    } else {
      this.router.navigateByUrl('/forums/posts-main');
    }
  }


  // Look for matches with user-selected query parameters
  private getQueryResults() {
    this.likeMeCountsSvc.getUserQueryCounts(this.matches)
    .pipe(untilComponentDestroyed(this))
    .subscribe(matchResults => {
      this.matchQueryParams(matchResults);
    }, error => {
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError({"message":"unable to listen for color theme","error":error});
    });
  }


  // Get user's profile and save
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
    }, error => {
      this.sentry.logError('UserQueryComponent:listenForUserProfile: error getting profile=' + error);
    });
  }


  private matchQueryParams(matchResults) {
    let likeMeAnswer: string;
    let name: string;
    let value: any;

    if (matchResults === 0) {
      this.queryResultMessagePrefix = this.translate.instant(
                                      'connections.component.resultPrefix0') + ':';
      this.queryMatches = false;
      this.disableSingleMatchForumOffer = true;
    } else {
      this.queryMatches = true;
      this.disableSingleMatchForumOffer = false;
      if (matchResults === 1) {
      this.queryResultMessagePrefix = matchResults + ' ' + this.translate.instant(
                                              'connections.component.resultPrefix1') + ':';
      } else {
        this.queryResultMessagePrefix = matchResults + ' ' + this.translate.instant(
                                              'connections.component.resultPrefix2') + ':';
      }
    }

    for (let i=0; i < this.matches.length; i++) {
      name = Object.keys(this.matches[i])[0];
      value = Object.values(this.matches[i])[0];

      // get original answers for those checked
      if (value === true || value === 'true') {
        likeMeAnswer = this.translate.instant('interests.component.interested') + ' ' +
                        this.translate.instant('interests.component.' + name);
      } else {
        if (name === 'rigBrand' || name === 'rigManufacturer' || name === 'rigModel' || name === 'rigYear') {
          likeMeAnswer = this.translate.instant('profile.component.' + name) + ' ' + value;
        } else {
          if (name === 'yearOfBirth' || name === 'rigLength') {
            likeMeAnswer = this.translate.instant('profile.component.' + name);
          } else {
            if (name === 'boondocking' || name === 'homeState' || name === 'homeCountry') {
              likeMeAnswer = this.translate.instant('profile.component.' + name) + ' ' + this.translate.instant('profile.component.list.' + name.toLowerCase() + '.' + value.toLowerCase());
            } else {
              likeMeAnswer = this.translate.instant('profile.component.list.' + name.toLowerCase() + '.' + value.toLowerCase());
            }
          }
        }
      }
      this.matchResults.push(likeMeAnswer);
    }
    this.showSpinner = false;
  }
}
