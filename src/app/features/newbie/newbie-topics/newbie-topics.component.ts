import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { NewbieTopicsService } from '@services/data-services/newbie-topics.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService } from '@services/share-data.service';

export interface Itopics {
  _id: string;
  topicID: string;
  topicDesc: string;
}

@Component({
  selector: 'app-rvlm-newbie-topics',
  templateUrl: './newbie-topics.component.html',
  styleUrls: ['./newbie-topics.component.scss']
})
export class NewbieTopicsComponent implements OnInit {
  @Input('userType') userType: string;

  authorizedTopics: Array<Itopics> = [];

  showSpinner: boolean= false;

  // Interface for profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private profileSvc: ProfileService,
              private translate: TranslateService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    this.listenForUserProfile();

    this.getAuthorizedTopics();

    this.getTopics();
  }

  ngOnDestroy() {}

  onTopic(topicID: string, topicDesc: string) {
    let params: string;

    console.log('HelpNewbieTopics:onTopic: checking topic=', topicID);
    if (!this.findTopic(topicID)) {
      console.log('HelpNewbieTopics:onTopic: topic not found, adding topic=', topicID);
      this.newbieTopicsSvc.addNewbieTopic(topicID,  topicDesc, this.profile.displayName, this.profile.profileImageUrl)
      .subscribe(topicResult => {
        console.log('HelpNewbieTopics:onTopic: topic added=', topicResult);
      }, error => {
        if (error.status === 403) {
          console.log('HelpNewbieTopics:onTopic: error=', error.message);
        } else {
          throw new Error(error);
        }
      });
    }
    if (this.userType === 'newbie') {
      switch(topicID) {
        case 'internet': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/internet');
          break;
        }
        case 'insurance': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/insurance');
          break;
        }
        case 'costFullTimeTravel': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/cost-ft-travel');
          break;
        }
        case 'makingMoneyOnTheRoad': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/making-money');
          break;
        }
        case 'savingMoney': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/saving-money');
          break;
        }
        case 'sellingHouse': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/selling-house');
          break;
        }
        case 'thingsYouNeedFullTime': {
          this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
          this.router.navigateByUrl('/newbie/things-need-ft');
          break;
        }
      }
    } else {
      params = '{"forumType":"topic","topic":"' + topicID + '","topicDesc":"' + topicDesc + '" }'
      this.shareDataSvc.setData(params);
      this.activateBackArrowSvc.setBackRoute('newbie/help-newbie');
      this.router.navigateByUrl('/forums');
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

  private getAuthorizedTopics() {
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"internet","topicDesc":"' + this.translate.instant('newbie-topics.component.internet') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"insurance","topicDesc":"' + this.translate.instant('newbie-topics.component.insurance') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"costFullTimeTravel","topicDesc":"' + this.translate.instant('newbie-topics.component.costFullTimeTravel') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"makingMoneyOnTheRoad","topicDesc":"' + this.translate.instant('newbie-topics.component.makingMoneyOnTheRoad') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"savingMoney","topicDesc":"' + this.translate.instant('newbie-topics.component.savingMoney') + '"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"sellingHouse","topicDesc":"' + this.translate.instant('newbie-topics.component.sellingHouse') +'"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"thingsYouNeedFullTime","topicDesc":"' + this.translate.instant('newbie-topics.component.thingsYouNeedFullTime') + '"}'));
  }


  private getTopics() {
    this.showSpinner = true;

    this.newbieTopicsSvc.getNewbieTopics()
    .subscribe(topicsResult => {
      console.log('HelpNewbieTopicsComponent:getTopics: result=', topicsResult);
      for (let i=0; i < topicsResult.length; i++) {
        this.updateAuthorizedTopics(topicsResult[i].topicID, topicsResult[i]._id);
      }
      this.showSpinner = false;
      console.log('HelpNewbieTopicsComponent:getTopics: auth=', this.authorizedTopics);
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
      console.error('HomeComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  private updateAuthorizedTopics(topicID: string, _id: string) {
    for (let i=0; i < this.authorizedTopics.length; i++) {
      console.log('HelpNewbieTopicsComponent:updateAuthorizedTopics: looking for topic ', topicID)
      if (topicID === this.authorizedTopics[i].topicID) {
        console.log('HelpNewbieTopicsComponent:updateAuthorizedTopics: found id ', topicID)
        this.authorizedTopics[i]._id = _id;
        console.log('HelpNewbieTopicsComponent:updateAuthorizedTopics: updated array=', this.authorizedTopics[i]);
      }
    }
  }
}
