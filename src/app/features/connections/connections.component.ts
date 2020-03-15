import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent implements OnInit {
  form: FormGroup;
  checkArray: FormArray;

  showSpinner = false;
  showAllMatches = false;
  showQueryResults = false;
  showSingleMatchForumOffer = true;
  disableSingleMatchForumOffer = true;
  disableCheckbox = false;
  showMultiMatchQuery = false;
  showQueryCancel = false;
  param: string;
  likeMeMatches = [];
  queryResult: number;
  queryResultMessage: string;
  queryMatches = false;

  private backPath = '';
  private likeMeItem: string;
  private likeMeDesc: string;
  private likeMeAnswer: string;
  private profileKeys = [];
  private profileValues = [];
  private matches = [];
  private likeMe: IlikeMeCounts;
  private likeMeCounts: Observable<IlikeMeCounts>;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private routeSubscription: any;
  private allUsersCount: number;

  constructor(private translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private route: ActivatedRoute,
              private shared: SharedComponent,
              private fb: FormBuilder) {
                this.form = this.fb.group({
                  likeMe: this.fb.array([])
                });
              }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.showSpinner = true;

    // Get user's profile
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in Profile component=', data);
      this.profile = data;
    });

    // If coming from a link on the home page, will have a param which will be one of the checkbox
    // items on this page and it should be checked (taken care of in the template based on param below)
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      console.log('INITIAL PARAMS=', params.item);
      if (params.item) {
        console.log('INITIAL=', params);
        this.param = params.item;
        this.showSingleMatchForumOffer = true;
        this.disableSingleMatchForumOffer = false;
        this.checkArray = this.form.get('likeMe') as FormArray;
        this.checkArray.push(new FormControl(this.param));
      }
    });

    // Get object containing counts of all other users that match this user's profile items
    this.likeMeCounts = this.likeMeCountsSvc.likeMeCounts;
    this.likeMeCounts
/*     .pipe(finalize(() => {
      console.log('finalized!');
      this.showSpinner = false;
    })) */
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.allUsersCount = data.allUsersCount;

      // Get the key/value pairs of returned matches/counts into arrays
      this.profileKeys = Object.keys(data);
      this.profileValues = Object.values(data);

      // Go through the key array.  For each key, get associated value.
      // If the value is null or false, skip it.  This means there were no matches
      // for that item with other users at this time.
      // If have a match, create a new array of nicely worded results that can be displayed
      // with checkboxes on the template.
      for (let i = 1; i < this.profileKeys.length; i++ ) {
        if (this.profileValues[i]) {
          if (this.profile[this.profileKeys[i]] === true) {
            this.likeMeAnswer = this.translate.instant(
              'interests.component.' + this.profileKeys[i]
            );
            if (this.profileValues[i] === 1) {
              this.likeMeDesc = this.translate.instant(
                'connections.component.interest1'
              );
            } else {
              this.likeMeDesc = this.translate.instant(
                'connections.component.interest'
              );
            }
          } else {
            if (this.profile[this.profileKeys[i]].substring(0, 1) !== '@') {
              if (this.profileValues[i] === 1) {
                this.likeMeDesc = this.translate.instant(
                  'connections.component.' + this.profileKeys[i] + '1'
                  );
              } else {
                this.likeMeDesc = this.translate.instant(
                  'connections.component.' + this.profileKeys[i]
                  );
              }
              this.likeMeAnswer = this.translate.instant(
                'profile.component.list.' + this.profileKeys[i].toLowerCase() + '.' + this.profile[this.profileKeys[i]].toLowerCase()
                );
              this.likeMeItem = this.profileValues[i] + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer;
              this.likeMeItem = '{"id":"' + this.profileKeys[i] + '", "match":"' + this.likeMeItem + '"}';
              this.likeMeItem = JSON.parse(this.likeMeItem);
              this.likeMeMatches.push(this.likeMeItem);
              console.log(this.likeMeItem);
              if (this.allUsersCount > 0) {
                this.showSpinner = false;
                this.showAllMatches = true;
              }
            }
          }
        }
      }
    }, (error) => {
      // this.showSpinner = false;
      console.error(error);
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }


  // Keep an array of checked fields
  // If the user selects a single checkbox, because we already know there are matches,
  // ask them if they would like to create/join a forum for any questions/discussions with
  // these users.
  // If the user selects more than one checkbox, ask them if they would like to do a query
  // to see if there are users that match multiple.
  onCheckboxChange(event: any) {
    this.checkArray = this.form.get('likeMe') as FormArray;
    if (event.checked) {
      this.checkArray.push(new FormControl(event.source.value));
    } else {
      let i: number = 0;
      this.checkArray.controls.forEach((item: FormControl) => {
        if (item.value == event.source.value) {
          this.checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    if (this.checkArray.length === 1) {
      this.showSingleMatchForumOffer = true;
      this.disableSingleMatchForumOffer = false;
      this.showMultiMatchQuery = false;
    } else if (this.checkArray.length > 1) {
      this.showMultiMatchQuery = true;
      this.showSingleMatchForumOffer = false;
    } else {
      this.showSingleMatchForumOffer = true;
      this.disableSingleMatchForumOffer = true;
      this.showMultiMatchQuery = false;
    }
  }

  onForum() {
    let name;
    let value;
    let i: number = 0;
    this.matches = [];

    this.activateBackArrowSvc.setBackRoute('connections');
    this.checkArray.controls.forEach((item: FormControl) => {
      name = item.value;
      value = this.profile[item.value];
      this.likeMeItem = '{"name":"' + name + '", "value":"' + value + '"}';
      this.likeMeItem = JSON.parse(this.likeMeItem);
      this.matches.push(this.likeMeItem);
      i++;
    });
    this.router.navigate(['/forums'], { queryParams: { matches: this.matches }});
  }

  onQuery() {
    this.showSpinner = true;
    let name = '';
    let value = '';

    this.queryResult = 0;
    this.queryResultMessage = '';

    let i: number = 0;
    this.checkArray.controls.forEach((item: FormControl) => {
      name = item.value;
      value = this.profile[item.value];
      this.likeMeItem = '{"name":"' + name + '", "value":"' + value + '"}';
      this.likeMeItem = JSON.parse(this.likeMeItem);
      this.matches.push(this.likeMeItem);
      i++;
    });
    this.likeMeCountsSvc.getUserQueryCounts(this.matches)
    .subscribe(data => {
      this.queryResult = data;
      if (this.queryResult === 0) {
        this.queryResultMessage = 'No matches found';
        this.queryMatches = false;
        this.disableSingleMatchForumOffer = true;
        this.disableCheckbox = true;
      } else {
        this.queryMatches = true;
        this.disableSingleMatchForumOffer = false;
        this.disableCheckbox = false;
        if (this.queryResult === 1) {
        this.queryResultMessage = this.queryResult + ' other that';
        } else {
          this.queryResultMessage = this.queryResult + ' others that';
        }
      }
      for (let i=0; i < this.matches.length; i++) {
        if (i > 0) {
          this.queryResultMessage = this.queryResultMessage + ' and ';
        }

        // get original answers for those checked
        if (this.matches[i].value === 'true') {
          this.likeMeAnswer = this.translate.instant(
            'interests.component.' + this.matches[i].name
          );
          if (this.queryResult === 1) {
            this.likeMeDesc = this.translate.instant(
              'connections.component.interest1'
            );
          } else {
            this.likeMeDesc = this.translate.instant(
              'connections.component.interest'
            );
          }
        } else {
          if (this.matches[i].value.substring(0, 1) !== '@') {
            if (this.queryResult === 1) {
              this.likeMeDesc = this.translate.instant(
                'connections.component.' + this.matches[i].name + '1'
                );
            } else {
              this.likeMeDesc = this.translate.instant(
                'connections.component.' + this.matches[i].name
                );
            }
            this.likeMeAnswer = this.translate.instant(
              'profile.component.list.' + this.matches[i].name.toLowerCase() + '.' + this.matches[i].value.toLowerCase()
              );
          }
        }
        this.queryResultMessage = this.queryResultMessage + ' ' + this.likeMeAnswer;
      }
      this.showAllMatches = false;
      this.showQueryResults = true;
      this.showSingleMatchForumOffer = true;
      this.showMultiMatchQuery = false;
      this.showQueryCancel = true;
      this.showSpinner = false;
    }, (error) => {
      console.warn('ERROR loading user counts: ', error);
      if (error.message.includes('Unknown Error')) {
        this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
      }
    });
  }

  onQueryCheckboxChange(event) {
    if (event.checked) {
      this.disableSingleMatchForumOffer = false;
    } else {
      this.disableSingleMatchForumOffer = true;
    }
  }

  onCancel() {
    this.showSingleMatchForumOffer = true;
    this.showMultiMatchQuery = false;
    this.showQueryResults = false;
    this.showAllMatches = true;
    this.showQueryCancel = false;
    this.disableSingleMatchForumOffer = true;
    for (let i = this.checkArray.length; i >= 0; i--) {
      console.log('remove ', i);
      this.checkArray.removeAt(i);
    };
    this.matches = [];
  }
}
