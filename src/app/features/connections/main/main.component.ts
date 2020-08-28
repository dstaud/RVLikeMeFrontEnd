import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService, IforumsMain, IuserQuery } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';
import { StandaloneService } from '@services/standalone.service';

@Component({
  selector: 'app-rvlm-connections-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  form: FormGroup;
  checkArray: FormArray;

  showSpinner = false;
  showAllMatches = false;
  showSingleMatchForumOffer = true;
  disableSingleMatchForumOffer = true;
  showMultiMatchQuery = false;
  showNoConnections = false;
  foundMatch = false;
  param: string;
  likeMeMatches = [];
  matches = [];
  theme: string;
  desktopUser: boolean = false;
  showFullExplanation: boolean = false;
  standalone: boolean = false;

  private likeMeItem: string;
  private likeMeDesc: string;
  private likeMeAnswer: string;
  private profileKeys: Array<string> = [];
  private profileValues = [];
  private likeMe: IlikeMeCounts;
  private likeMeCounts: Observable<IlikeMeCounts>;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private routeSubscription: any;
  private allUsersCount: number;
  private allCountsReceived: boolean = false;


  constructor(private translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private route: ActivatedRoute,
              private themeSvc: ThemeService,
              private shareDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private standaloneSvc: StandaloneService,
              private device: DeviceService,
              private fb: FormBuilder) {
                this.listenForStandalone();
                this.form = this.fb.group({
                  likeMe: this.fb.array([])
                });
              }

  // To speed up load of the dashboard, I broke up getting the like-me counts into two pieces.  Here I have the three from the dashboard show up first
  // with the checkbox if user clicked from dashboard.   Then it comes back sometime later with all of them.  Spinner shows working to get more
  // but could not have the checkboxes that were there disabled.   User can click while spinner is going which is bad.  Tried several things
  // to make that work and finally decided MVP for release 1 is OK without that.
  // I could, in the second like-me count call, just get the remaining counts and append them.  That may work.
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

      this.showSpinner = true;

      this.listenForColorTheme();

      this.listenForUserProfile();

      this.listenForParameters();

      this.listenForLikeMeCounts();
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.device.iPhoneModelXPlus && this.standalone) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    if (this.desktopUser) {
      topSpacing = 'desktop-spacing';
    } else {
      topSpacing = 'device-spacing';
    }

    containerClass = 'container ' + bottomSpacing + ' ' + topSpacing;

    return containerClass;
  }


  onProfile() {
    this.activateBackArrowSvc.setBackRoute('connections/main', 'forward');
    this.router.navigateByUrl('/profile/main');
  }

  // Display user-readable matches with counts
  private displayMatches(counts) {
    this.allUsersCount = counts.allUsersCount;

    if (counts.allCounts) {
      this.allCountsReceived = true;
    }
    this.likeMeMatches = [];

    // Get the key/value pairs of returned matches/counts into arrays
    this.profileKeys = Object.keys(counts);
    this.profileValues = Object.values(counts);

    // Go through the key array.  For each key, get associated value.
    // If the value is null or false, skip it.  This means there were no matches
    // for that item with other users at this time.
    // If have a match, create a new array of nicely worded results that can be displayed
    // with checkboxes on the template.
    for (let i = 1; i < this.profileKeys.length; i++ ) {
      if (this.profileValues[i] && this.profileValues[i] !== null && this.profileValues[i] !== 'null' && this.profileKeys[i] !== 'allCounts') {
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
          if (typeof(this.profile[this.profileKeys[i]]) !== 'number' && this.profile[this.profileKeys[i]]) {  // numeric variables
            if (this.profileKeys[i] !== 'allCounts') {
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
                if (this.profileKeys[i] === 'rigManufacturer' || this.profileKeys[i] === 'rigBrand' || this.profileKeys[i] === 'rigModel') {
                  this.likeMeAnswer = this.profile[this.profileKeys[i]];
                  this.processMatch(this.profileKeys[i], this.profileValues[i]);
                } else {
                    if (this.profileKeys[i] === 'yearOfBirth' || this.profileKeys[i] === 'rigLength') {
                      this.likeMeAnswer = 'profile.component.' + name;
                    } else {
                      this.likeMeAnswer = this.translate.instant(
                        'profile.component.list.' + this.profileKeys[i].toLowerCase() + '.' + this.profile[this.profileKeys[i]].toLowerCase()
                        );
                      this.processMatch(this.profileKeys[i], this.profileValues[i]);
                    }
                }
              }
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
            if (this.profileKeys[i] === 'rigYear') {
              this.likeMeAnswer = this.profile[this.profileKeys[i]];
            } else {
              this.likeMeAnswer = this.translate.instant('profile.component.' + this.profileKeys[i]);
            }

            this.processMatch(this.profileKeys[i], this.profileValues[i]);
          }
        }
      }
    }

    // If allUsersCount is zero then this is initial BehaviorSubject, not real data from DB
    // If it is real data, but no data found (i.e. !this.foundMatch) then show no-results text
    // if (this.allUsersCount > 0 && this.allCountsReceived) {
    if (this.allCountsReceived) {
      this.form.get('likeMe').disable({onlySelf: true});
      this.showSpinner = false;
      if (!this.foundMatch) {
        this.showNoConnections = true;
      }
    }
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
    let queryParams:IforumsMain = {
      forumType: 'group',
      theme: this.theme
    }
    this.activateBackArrowSvc.setBackRoute('connections/main', 'forward');
    this.checkArray.controls.forEach((item: FormControl) => {
      name = item.value;
      value = this.profile[item.value];
      queryParams[name] = value;
      i++;
    });
    this.shareDataSvc.setData('forumsMain', queryParams);
    if (this.desktopUser) {
      this.router.navigateByUrl('/forums/main');
    } else {
      this.router.navigateByUrl('/forums/posts-main');
    }

  }


  // If user wants to query on more than one match point then set up an array of data from
  // user selection and switch to child query component by setting showQueryResults = true.
  onQuery() {
    let name = '';
    let value = '';
    let i: number = 0;
    let matches: Array<IuserQuery> = [];
    let likeMeItem:IuserQuery;

    this.checkArray.controls.forEach((item: FormControl) => {
      likeMeItem = {};

      name = item.value;
      value = this.profile[item.value];

      likeMeItem[name] = value;
      matches.push(likeMeItem);
      i++;
    });

    this.shareDataSvc.setData('userQuery',matches);
    this.activateBackArrowSvc.setBackRoute('connections/main', 'forward');
    this.router.navigateByUrl('/connections/user-query');
  }


  // If there is a checkbox checked, allow user to go to forums
  onQueryCheckboxChange(event) {
    if (event.checked) {
      this.disableSingleMatchForumOffer = false;
    } else {
      this.disableSingleMatchForumOffer = true;
    }
  }


  onRefresh() {
    this.showSpinner = true;
    this.likeMeCountsSvc.getLikeMeCountsSecondary();
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

  // If coming from a link on the home page, will have a param which will be one of the checkbox
  // items on this page and it should be checked (taken care of in the template based on param below)
  private listenForParameters() {
    this.routeSubscription = this.route
    .queryParams
    .pipe(untilComponentDestroyed(this))
    .subscribe(params => {
      if (params.item) {
        this.param = params.item;
        this.showSingleMatchForumOffer = true;
        this.disableSingleMatchForumOffer = false;
        this.checkArray = this.form.get('likeMe') as FormArray;
        this.checkArray.push(new FormControl(this.param));
      }
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"unable to listen for parameters","error":error}));
    });
  }

  private listenForStandalone() {
    this.standaloneSvc.standalone$
    .subscribe(standalone => {
      if (standalone) {
        this.standalone = standalone;
      }
    }, error => {
      this.sentry.logError('ConnectionsMainComponent.listenForStandalone: error=' + JSON.stringify(error));
    })
  }

  // Get object containing counts of all other users that match this user's profile items
  // and then takes action
  private listenForLikeMeCounts() {
    this.likeMeCounts = this.likeMeCountsSvc.likeMeCounts;
    this.likeMeCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      this.displayMatches(counts);
    }, (error) => {
      this.showSpinner = false;
      this.sentry.logError(JSON.stringify({"message":"unable to listen for like me counts","error":error}));
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
      this.sentry.logError('ConnectionsComponent:listenForUserProfile: error getting profile ' + JSON.stringify(error));
    });
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
