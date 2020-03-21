import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { isNumber } from 'util';
import { Observable } from 'rxjs';
// import { finalize } from 'rxjs/operators';

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
  showMultiMatchQuery = false;
  showNoConnections = false;
  foundMatch = false;
  param: string;
  likeMeMatches = [];
  matches = [];

  private backPath = '';
  private likeMeItem: string;
  private likeMeDesc: string;
  private likeMeAnswer: string;
  private profileKeys = [];
  private profileValues = [];
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
      this.profile = data;
    });

    // If coming from a link on the home page, will have a param which will be one of the checkbox
    // items on this page and it should be checked (taken care of in the template based on param below)
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      if (params.item) {
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
            this.foundMatch = true;
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
            this.processMatch(this.profileKeys[i], this.profileValues[i]);
          } else {
            if (!isNumber(this.profile[this.profileKeys[i]])) {
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
                  this.processMatch(this.profileKeys[i], this.profileValues[i]);
              }
            } else {
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
                'profile.component.' + this.profileKeys[i]
                );
                this.processMatch(this.profileKeys[i], this.profileValues[i]);
            }
          }
        }
      }
      // If allUsersCount is zero then this is initial BehaviorSubject, not real data from DB
      // If it is real data, but no data found (i.e. !this.foundMatch) then show no-results text
      if (this.allUsersCount > 0) {
        this.showSpinner = false;
        if (!this.foundMatch) {
          this.showNoConnections = true;
        }
      }
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  // Called from child component if user clicks on the cancel button there.
  // In this case, clear the array of checked items and hide query child component.
  onCancelQuery(event: boolean) {
    for (let i = this.checkArray.length; i >= 0; i--) {
      this.checkArray.removeAt(i);
    }
    this.showQueryResults = false;
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

  // If user clicks button to go to forum, collect data needed by forum about the matches and send as params
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

  // If user wants to query on more than one match point then set up an array of data from
  // user selection and switch to child query component by setting showQueryResults = true.
  onQuery() {
    let name = '';
    let value = '';

    this.matches = [];

    let i: number = 0;
    this.checkArray.controls.forEach((item: FormControl) => {
      name = item.value;
      value = this.profile[item.value];
      this.likeMeItem = '{"name":"' + name + '", "value":"' + value + '"}';
      this.likeMeItem = JSON.parse(this.likeMeItem);
      this.matches.push(this.likeMeItem);
      i++;
    });
    this.showQueryResults = true;
  }

  // If there is a checkbox checked, allow user to go to forums
  onQueryCheckboxChange(event) {
    if (event.checked) {
      this.disableSingleMatchForumOffer = false;
    } else {
      this.disableSingleMatchForumOffer = true;
    }
  }

  private processMatch(key: string, value: string) {
    this.foundMatch = true;
    this.likeMeItem = value + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer;
    this.likeMeItem = '{"id":"' + key + '", "match":"' + this.likeMeItem + '"}';
    this.likeMeItem = JSON.parse(this.likeMeItem);
    this.likeMeMatches.push(this.likeMeItem);
    if (this.allUsersCount > 0) {
      this.showAllMatches = true;
    }
  }
}
