import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { NewbieTopicsService } from '@services/data-services/newbie-topics.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService } from '@services/share-data.service';
import { UserTypeService } from '@services/user-type.service';

import { SuggestTopicDialogComponent } from '@dialogs/suggest-topic-dialog/suggest-topic-dialog.component';

import { SharedComponent } from '@shared/shared.component';

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
  authorizedTopics: Array<Itopics> = [];
  userType: string;

  showSpinner: boolean= false;

  // Interface for profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private profileSvc: ProfileService,
              private translate: TranslateService,
              private shareDataSvc: ShareDataService,
              private dialog: MatDialog,
              private shared: SharedComponent,
              private userTypeSvc: UserTypeService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    console.log('NewbieTopicsComponent:ngOnInit')
    this.listenForUserProfile();

    this.listenForUserType();

    this.getAuthorizedTopics();

    this.getTopics();
  }

  ngOnDestroy() {}


  // Open dialog for user to update their post
  onOpenSuggestTopicDialog(): void {
    const dialogRef = this.dialog.open(SuggestTopicDialogComponent, {
      disableClose: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      this.showSpinner = true;
      if (result !== 'canceled') {
        this.newbieTopicsSvc.addNewbieSuggestTopic(result, this.profile.displayName, this.profile.profileImageUrl)
        .subscribe(suggestResult => {
          this.showSpinner = false;
          console.error('NewbieTopicsComponent:onOpenSuggestTopicDialog: suggestion= ', suggestResult);
        }, error => {
          this.showSpinner = false;
          console.error('NewbieTopicsComponent:onOpenSuggestTopicDialog: throw error ', error);
        });

        this.shared.openSnackBar('Thank you for your suggestion! The information has been sent on','message', 4000);
      } else {
        this.showSpinner = false;
      }
    });
  }


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

    params = '{"topicID":"' + topicID + '","topicDesc":"' + topicDesc + '"}';
    this.shareDataSvc.setData(params);
    this.activateBackArrowSvc.setBackRoute('newbie/need-help-newbie');
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
        console.log('NewbieTopicsComponent:updateAuthorizedTopics: updated array=', this.authorizedTopics[i]);
      }
    }
  }
}
