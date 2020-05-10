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
import { ShareDataService } from '@services/share-data.service';

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
  matches: Array<{name: string, value: string}> = [];
  queryResultMessagePrefix: string;
  matchResults = [];
  theme: string;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private likeMeCountsSvc: LikemeCountsService,
              private router: Router,
              private shareDataSvc: ShareDataService,
              private themeSvc: ThemeService) { }

  ngOnInit() {
    let sharedData: any;
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

    this.showSpinner = true;

    console.log('UserQueryComponent:ngOnInit: in ngOnInit');

    if (this.shareDataSvc.getData()) {
      let sharedData = this.shareDataSvc.getData();
      if (sharedData.matches !== undefined) {
        console.log('UserQueryComponent:ngOnInit: matches exists?', sharedData.matches);
        this.matches = sharedData.matches;
        console.log('UserQueryComponent:ngOnInit: matches=', this.matches);

        this.listenForColorTheme();

        this.getQueryResults();

        this.listenForUserProfile();

      } else {
        console.log('UserQueryComponent:ngOnInit: going to connections/main');
        this.router.navigateByUrl('/connections/main');
      }
    } else {
      console.log('UserQueryComponent:ngOnInit: going to connections/main');
      this.router.navigateByUrl('/connections/main');
    }
  }

  ngOnDestroy() {}


  // If user selects cancel
  onCancel() {
    this.router.navigateByUrl('connections/main');
  }


  // When user selects the forum group, save the parameters in a shared data service
  onSelectForumGroup() {
    let name: string;
    let value: any;

    let queryParams = '{';
    name = this.matches[0].name;
    value = this.matches[0].value;
    queryParams = queryParams + '"' + name + '":"' + value + '"';
    for (let i=1; i < this.matches.length; i++) {
      name = this.matches[i].name;
      value = this.matches[i].value;
      queryParams = queryParams + ',"' + name + '":"' + value + '"';
    }
    queryParams = queryParams + ',"forumType":"group"';
    queryParams = queryParams + '}'

    this.shareDataSvc.setData(queryParams);
    this.activateBackArrowSvc.setBackRoute('', 'nostack');
    this.router.navigateByUrl('/forums/main');
  }


  // Look for matches with user-selected query parameters
  private getQueryResults() {
    console.log('UserQueryComponent:getQueryResults: matches=', this.matches);
    this.likeMeCountsSvc.getUserQueryCounts(this.matches)
    .subscribe(matchResults => {
      this.matchQueryParams(matchResults);
    }, error => {
      console.error('UserQueryComponent:getQueryResults: throw error ', error);
      throw new Error(error);
    });
  }


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
      console.log('ForumsListComponent:listenForColorTheme: Theme=', this.theme);
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
      console.error('UserQueryComponent:listenForUserProfile: throw error ', error);
      throw new Error(error);
    });
  }


  private matchQueryParams(matchResults) {
    let likeMeAnswer: string;

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

    // determine appropriate group attribute names for display and store in array
    // this.queryParam = '{';
    for (let i=0; i < this.matches.length; i++) {

      // get original answers for those checked
      if (this.matches[i].value === 'true') {
        likeMeAnswer = this.translate.instant(
                            'interests.component.' + this.matches[i].name
        );
      } else {
/*           likeMeDesc = this.translate.instant( // What is this?  I think not needed
                            'connections.component.' + this.matches[i].name
          ); */
          if (this.matches[i].name === 'yearOfBirth') {
            likeMeAnswer = this.translate.instant(
                                'profile.component.' + this.matches[i].name
              );
          } else {
            likeMeAnswer = this.translate.instant(
                                'profile.component.list.' + this.matches[i].name.toLowerCase() +
                                '.' + this.matches[i].value.toLowerCase()
              );
          }
      }
      this.matchResults.push(likeMeAnswer);
      // this.queryParam = this.queryParam + '"' + this.matches[i].name + '":"' + this.matches[i].value + '",';
    }
    // this.queryParam = this.queryParam + '"theme":"' + this.theme + '"}';
    this.showSpinner = false;
  }
}
