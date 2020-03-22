import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LikemeCountsService } from '@services/data-services/likeme-counts.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-user-query',
  templateUrl: './user-query.component.html',
  styleUrls: ['./user-query.component.scss']
})
export class UserQueryComponent implements OnInit {

  @Input('matches')
  public matches: Array<{name: string, value: string}>;

  @Output() onCancelQuery = new EventEmitter()

  form: FormGroup;

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

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private queryResult: number;
  private backPath: string;
  private likeMeItem: string;
  private likeMeAnswer: string;
  private likeMeDesc: string;
  private queryParam: string;
  private totalLength = 0;

  constructor(private translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private likeMeCountsSvc: LikemeCountsService,
              private router: Router,
              private shared: SharedComponent) { }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.showSpinner = true;
    let name = '';
    let value = '';

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
        this.queryParam = this.queryParam + '"' + this.matches[i].name + '":"' + this.matches[i].value + '"';
        if (i !== this.matches.length - 1) { this.queryParam = this.queryParam + ','}
      }
      this.queryParam = this.queryParam + '}';
      this.showSpinner = false;
    }, (error) => {
      console.warn('ERROR loading user counts: ', error);
      if (error.message.includes('Unknown Error')) {
        this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
      }
    });

    this.showSpinner = true;

    // Get user's profile
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
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
    this.matches = [];

    this.activateBackArrowSvc.setBackRoute('connections');
    this.router.navigate(['/forums'], { queryParams: { queryParam: this.queryParam }});
  }
}
