import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
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

  @Input('matches') matches: Array<{name: string, value: string}>;

  @Output() onCancelQuery = new EventEmitter()

  showSpinner = false;
  showAllMatches = false;
  showQueryResults = false;
  showSingleMatchForumOffer = true;
  disableSingleMatchForumOffer = true;
  showMultiMatchQuery = false;
  showQueryCancel = false;
  showNoConnections = false;
  queryMatches = false;
  queryResultMessage: string;
  queryResultMessagePrefix: string;
  results = [];
  theme: string;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private queryResult: number;
  private backPath: string;
  private likeMeAnswer: string;
  private likeMeDesc: string;
  private queryParam: string;

  constructor(private translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private likeMeCountsSvc: LikemeCountsService,
              private router: Router,
              private shareDataSvc: ShareDataService,
              private themeSvc: ThemeService) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    console.log('UserQueryComponent:ngOnInit: matches input=', this.matches);
    // Listen for changes in color theme;
    console.log('ForumsListComponent:ngOnInit: getting theme');
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
      console.log('ForumsListComponent:ngOnInit: Theme=', this.theme);
    });

    this.showSpinner = true;

    this.queryResult = 0;
    this.queryResultMessage = '';
    this.likeMeCountsSvc.getUserQueryCounts(this.matches)
    .subscribe(data => {
      this.queryResult = data;
      if (this.queryResult === 0) {
        this.queryResultMessagePrefix = this.translate.instant(
          'connections.component.resultPrefix0') + ':';
        this.queryMatches = false;
        this.disableSingleMatchForumOffer = true;
      } else {
        this.queryMatches = true;
        this.disableSingleMatchForumOffer = false;
        if (this.queryResult === 1) {
        this.queryResultMessagePrefix = this.queryResult + ' ' + this.translate.instant(
          'connections.component.resultPrefix1') + ':';
        } else {
          this.queryResultMessagePrefix = this.queryResult + ' ' + this.translate.instant(
          'connections.component.resultPrefix2') + ':';
        }
      }
      this.queryParam = '{';
      for (let i=0; i < this.matches.length; i++) {
        // get original answers for those checked
        if (this.matches[i].value === 'true') {
          this.likeMeAnswer = this.translate.instant(
            'interests.component.' + this.matches[i].name
          );
        } else {
            this.likeMeDesc = this.translate.instant(
              'connections.component.' + this.matches[i].name
            );
            if (this.matches[i].name === 'yearOfBirth') {
              this.likeMeAnswer = this.translate.instant(
                'profile.component.' + this.matches[i].name
                );
            } else {
              this.likeMeAnswer = this.translate.instant(
                'profile.component.list.' + this.matches[i].name.toLowerCase() + '.' + this.matches[i].value.toLowerCase()
                );
            }
        }
        this.results.push(this.likeMeAnswer);
        this.queryParam = this.queryParam + '"' + this.matches[i].name + '":"' + this.matches[i].value + '",';
      }
      this.queryParam = this.queryParam + '"theme":"' + this.theme + '"}';
      this.showSpinner = false;
    }, error => {
      console.log('UserQueryComponent:ngOnInit: throw error ', error);
      throw new Error(error);
    });

    this.showSpinner = true;

    // Get user's profile
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      console.log('User-QueryComponent:ngOnInit: got new profile data=', data);
    }, error => {
      console.log('UserQueryComponent:ngOnInit: throw error ', error);
      throw new Error(error);
    });
  }

  ngOnDestroy() {}

  onCancel() {
    this.onCancelQuery.emit();
  }

  onForum() {
    let name;
    let value;
    let i: number = 0;

    let queryParams = '{';
    name = this.matches[0].name;
    value = this.matches[0].value;
    queryParams = queryParams + '"' + name + '":"' + value + '"';
    for (let i=1; i < this.matches.length; i++) {
      name = this.matches[i].name;
      value = this.matches[i].value;
      queryParams = queryParams + ',"' + name + '":"' + value + '"';
    }
    queryParams = queryParams + '}'
    console.log('UserQueryComponent:onForum: navigate to forums with ', queryParams)

    this.shareDataSvc.setData(queryParams);
    this.activateBackArrowSvc.setBackRoute('connections');
    this.router.navigateByUrl('/forums');
  }
}
