import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { NewbieTopicsService } from '@services/data-services/newbie-topics.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService, InewbieTopic } from '@services/share-data.service';
import { UserTypeService } from '@services/user-type.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { AdminService } from '@services/data-services/admin.service';

import { SharedComponent } from '@shared/shared.component';

export interface Itopics {
  _id: string;
  topicID: string;
  topicDesc: string;
}

@Component({
  selector: 'app-rvlm-newbie-topics',
  templateUrl: './newbie-topics.component.html',
  styleUrls: ['./newbie-topics.component.scss'],
  animations: [
    trigger('suggestTopicSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})
export class NewbieTopicsComponent implements OnInit {
  form: FormGroup;
  authorizedTopics: Array<Itopics> = [];
  userType: string;
  suggestTopicOpen: string = 'out';
  readyToSuggest: boolean = false;

  showSpinner: boolean= false;

  // Interface for profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private profileSvc: ProfileService,
              private translate: TranslateService,
              private shareDataSvc: ShareDataService,
              private shared: SharedComponent,
              private sentry: SentryMonitorService,
              private adminSvc: AdminService,
              private userTypeSvc: UserTypeService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  suggestTopic: new FormControl('', Validators.required)
                });
  }

  ngOnInit(): void {
    this.listenForUserProfile();

    this.listenForUserType();

    this.getAuthorizedTopics();

    this.getTopics();
  }

  ngOnDestroy() {}



  onSuggestTopic() {
    let suggestionType = 'newbie topic';

    this.showSpinner = true;
    if (this.form.controls.suggestTopic.value) {
      this.adminSvc.addSuggestion(this.form.controls.suggestTopic.value, suggestionType,
                                  this.profile.displayName, this.profile.profileImageUrl)
      .subscribe(suggestResult => {
        this.showSpinner = false;
        this.form.patchValue({
          suggestTopic: ''
        });
        this.readyToSuggest = false;
        this.suggestTopicOpen = 'out';
        this.shared.openSnackBar('You suggestion has been forwarded to the administrator.  Thank you!', "message", 3000);
      }, error => {
        this.showSpinner = false;
        this.suggestTopicOpen = 'out';
        this.form.patchValue({
          suggestTopic: ''
        });
        this.shared.openSnackBar('You suggestion has been forwarded to the administrator.  Thank you!', "message", 3000);
        this.readyToSuggest = false;
        console.error('InterestsComponent:onSuggestInterest: error saving suggestion=', error);
        this.sentry.logError(error);
      });
    }
  }


  onSuggestTopicOpen() {
    this.suggestTopicOpen = this.suggestTopicOpen === 'out' ? 'in' : 'out';
  }


  onTopic(topicID: string, topicDesc: string) {
    let params: InewbieTopic;

    if (!this.findTopic(topicID)) {

      this.newbieTopicsSvc.addNewbieTopic(topicID,  topicDesc, this.profile.displayName, this.profile.profileImageUrl)
      .subscribe(topicResult => {
      }, error => {
        if (error.status === 403) {
          this.sentry.logError({"status":403,"message":"unable to listen for like me counts","error":error});
        } else {
          throw new Error(error);
        }
      });
    }

    params = {
      topicID: topicID,
      topicDesc: topicDesc
    }

    this.shareDataSvc.setData('newbieTopic', params);
    this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie', 'forward');
    this.router.navigateByUrl('/newbie/topic');
  }

  private findTopic(topicID: string): boolean {
    let foundTopic: boolean = false;

    for (let i=0; i < this.authorizedTopics.length; i++) {
      if (topicID === this.authorizedTopics[i].topicID) {
        if (this.authorizedTopics[i]._id) {
          foundTopic = true;
          break;
        }
      }
    }
    return foundTopic;
  }

  private getAuthorizedTopics() {
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"internet","topicDesc":"' + this.translate.instant('newbie-topics.component.internet') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"insurance","topicDesc":"' + this.translate.instant('newbie-topics.component.insurance') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"costFullTimeTravel","topicDesc":"' + this.translate.instant('newbie-topics.component.costFullTimeTravel') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"domicile","topicDesc":"' + this.translate.instant('newbie-topics.component.domicile') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"makingMoneyOnTheRoad","topicDesc":"' + this.translate.instant('newbie-topics.component.makingMoneyOnTheRoad') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"savingMoney","topicDesc":"' + this.translate.instant('newbie-topics.component.savingMoney') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"sellingHouse","topicDesc":"' + this.translate.instant('newbie-topics.component.sellingHouse') +'"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"thingsYouNeedFullTimeTravel","topicDesc":"' + this.translate.instant('newbie-topics.component.thingsYouNeedFullTimeTravel') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"thingsYouNeedFullTimeStationary","topicDesc":"' + this.translate.instant('newbie-topics.component.thingsYouNeedFullTimeStationary') + '"}'));
  }


  private getTopics() {
    this.showSpinner = true;

    this.newbieTopicsSvc.getNewbieTopics()
    .subscribe(topicsResult => {
      for (let i=0; i < topicsResult.length; i++) {
        this.updateAuthorizedTopics(topicsResult[i].topicID, topicsResult[i]._id);
      }
      this.showSpinner = false;
    })
  }


  // Get user profile
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
    }, (error) => {
      console.error('NewbieTopicsComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  private listenForUserType() {
    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;
    }, (error) => {
      console.error('NewbieTopicsComponent:listenForUserType: error ', error);
      throw new Error(error);
    });
  }


  private updateAuthorizedTopics(topicID: string, _id: string) {
    for (let i=0; i < this.authorizedTopics.length; i++) {
      if (topicID === this.authorizedTopics[i].topicID) {
        this.authorizedTopics[i]._id = _id;
      }
    }
  }
}
