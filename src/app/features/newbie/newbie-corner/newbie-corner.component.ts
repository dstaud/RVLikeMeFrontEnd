import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
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
import { AuthenticationService } from '@services/data-services/authentication.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';
import { TopicComponent } from './../newbie-topics/topic/topic.component';

export interface Itopics {
  _id: string;
  topicID: string;
  topicDesc: string;
}

@Component({
  selector: 'app-rvlm-newbie-corner',
  templateUrl: './newbie-corner.component.html',
  styleUrls: ['./newbie-corner.component.scss']
})
export class NewbieCornerComponent implements OnInit {
  @Output() topicSelected = new EventEmitter<InewbieTopic>();

  @ViewChild(TopicComponent)
  public topic: TopicComponent;

  form: FormGroup;
  authorizedTopics: Array<Itopics> = [];
  userType: string;
  suggestTopicOpen: string = 'out';
  readyToSuggest: boolean = false;
  desktopUser: boolean = false;

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
              private device: DeviceService,
              private authSvc: AuthenticationService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  suggestTopic: new FormControl('', Validators.required)
                });
  }

  ngOnInit(): void {
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

      this.listenForUserProfile();

      this.listenForUserType();

      this.getAuthorizedTopics();

      this.getTopics();
    }
  }

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.device.iPhoneModelXPlus) {
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

  onSuggestTopic() {
    let suggestionType = 'newbie topic';

    this.showSpinner = true;
    if (this.form.controls.suggestTopic.value) {
      this.adminSvc.addSuggestion(this.form.controls.suggestTopic.value, suggestionType,
                                  this.profile.displayName, this.profile.profileImageUrl)
      .pipe(untilComponentDestroyed(this))
      .subscribe(suggestResult => {
        this.showSpinner = false;
        this.form.reset();
        this.readyToSuggest = false;
        this.suggestTopicOpen = 'out';
        this.shared.openSnackBar(this.translate.instant('newbie-topics.component.suggestionAdmin'), "message", 3000);
      }, error => {
        this.showSpinner = false;
        this.suggestTopicOpen = 'out';
        this.form.reset();
        this.shared.openSnackBar(this.translate.instant('newbie-topics.component.suggestionAdmin'), "message", 3000);
        this.readyToSuggest = false;

        this.sentry.logError('NewbieCornerComponent:onSuggestTopic: error suggesting topic=' + JSON.stringify(error));
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
      .pipe(untilComponentDestroyed(this))
      .subscribe(topicResult => {
      }, error => {
        if (error.status === 403) {
          this.sentry.logError(JSON.stringify({"status":403,"message":"unable to listen for like me counts","error":error}));
        } else {
          this.shared.notifyUserMajorError(error);
          throw new Error(JSON.stringify(error));
        }
      });
    }

    params = {
      topicID: topicID,
      topicDesc: topicDesc
    }

    this.shareDataSvc.setData('newbieTopic', params);
    this.activateBackArrowSvc.setBackRoute('newbie/newbie-corner', 'forward');

    if (this.desktopUser) {
      this.topicSelected.emit(params);
    } else {
      this.router.navigateByUrl('/newbie/topic');
    }
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

  // When adding new topics, add an entry here and in Newbie-topics and add the 4 corresponding language translations
  private getAuthorizedTopics() {
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"internet","topicDesc":"' + this.translate.instant('newbie-topics.component.internet') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"insurance","topicDesc":"' + this.translate.instant('newbie-topics.component.insurance') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"fulltimeTravel","topicDesc":"' + this.translate.instant('newbie-topics.component.fulltimeTravel') +'"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"thingsYouNeedFullTimeTravel","topicDesc":"' + this.translate.instant('newbie-topics.component.thingsYouNeedFullTimeTravel') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"costFullTimeTravel","topicDesc":"' + this.translate.instant('newbie-topics.component.costFullTimeTravel') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"domicile","topicDesc":"' + this.translate.instant('newbie-topics.component.domicile') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"boondocking","topicDesc":"' + this.translate.instant('newbie-topics.component.boondocking') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"makingMoneyOnTheRoad","topicDesc":"' + this.translate.instant('newbie-topics.component.makingMoneyOnTheRoad') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"savingMoney","topicDesc":"' + this.translate.instant('newbie-topics.component.savingMoney') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"sellingHouse","topicDesc":"' + this.translate.instant('newbie-topics.component.sellingHouse') +'"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"thingsYouNeedFullTimeStationary","topicDesc":"' + this.translate.instant('newbie-topics.component.thingsYouNeedFullTimeStationary') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"towingCapacity","topicDesc":"' + this.translate.instant('newbie-topics.component.towingCapacity') + '"}'));
  }


  private getTopics() {
    this.showSpinner = true;

    this.newbieTopicsSvc.getNewbieTopics()
    .pipe(untilComponentDestroyed(this))
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
      this.sentry.logError('NewbieTopicsComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
    });
  }


  private listenForUserType() {
    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;
    }, (error) => {
      this.sentry.logError('NewbieTopicsComponent:listenForUserType: error ' + JSON.stringify(error));
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
