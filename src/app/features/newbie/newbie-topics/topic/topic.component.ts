import { Component, OnInit, OnDestroy, ViewChild, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService, IforumsMain, InewbieTopic } from '@services/share-data.service';
import { DeviceService } from '@services/device.service';
import { UserTypeService } from '@services/user-type.service';

import { Itopics } from './../../newbie-corner/newbie-corner.component';
import { NewbieLinksComponent } from './../newbie-links/newbie-links.component';

@Component({
  selector: 'app-rvlm-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  @ViewChild(NewbieLinksComponent)
  public newbieLinks: NewbieLinksComponent;

  profile: IuserProfile;
  topicID: string;
  topicDesc: string;
  title: string;
  header: string;
  userType: string;

  private desktopUser: boolean = false;
  private authorizedTopics: Array<Itopics> = [];
  private userProfile: Observable<IuserProfile>;

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private profileSvc: ProfileService,
              private route: ActivatedRoute,
              private router: Router,
              private device: DeviceService,
              private translate: TranslateService,
              private userTypeSvc: UserTypeService,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
    if (window.innerWidth > 600) {
      this.desktopUser = true;
    }

    this.listenForUserProfile();

    this.listenForUserType();
  }

  ngOnDestroy() {}

  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }


  newbieInit(params: InewbieTopic) {
    console.log('TopicComponent:newbieInit: back over here=', params)
    this.topicID = params.topicID;
    this.topicDesc = params.topicDesc;

    this.title = 'newbie-topics.component.' + this.topicID;
    if (this.userType === 'expert') {
      this.header = 'newbie-topics.component.' + this.topicID + 'HeaderExpert';
    } else {
      this.header = 'newbie-topics.component.' + this.topicID + 'HeaderNewbie';
    }

    this.newbieLinks.initialize(params);
  }

  onGroup() {
    let params:IforumsMain = {
      forumType: 'topic',
      topicID: this.topicID,
      topicDesc: this.topicDesc
    }

    this.activateBackArrowSvc.setBackRoute('newbie/topic', 'forward');
    this.shareDataSvc.setData('forumsMain', params);
    if (this.desktopUser) {
      this.router.navigateByUrl('/forums/main');
    } else {
      this.router.navigateByUrl('/forums/posts-main');
    }

  }

  onLinkAdded(event: any) {

  }


  // Get user profile
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
    }, error => {
      console.error('TopicComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  listenForUserType() {
    let paramData: InewbieTopic;

    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;

      if (!this.shareDataSvc.getData('newbieTopic').topicID) {
        this.getAuthorizedTopics();
        this.initialize();
      } else {
        paramData = this.shareDataSvc.getData('newbieTopic');
        this.topicID = paramData.topicID;
        this.topicDesc = paramData.topicDesc;
      }

      console.log('TopicComponent:listenForUserType: topicid=', this.topicID, ' topicDesc=', this.topicDesc)

      this.title = 'newbie-topics.component.' + this.topicID;
      if (type === 'expert') {
        this.header = 'newbie-topics.component.' + this.topicID + 'HeaderExpert';
      } else {
        this.header = 'newbie-topics.component.' + this.topicID + 'HeaderNewbie';
      }

      if (!this.shareDataSvc.getData('newbieTopic').topicID) {
        this.newbieLinks.initialize(paramData);
      }

    }, error => {
      console.error('TopicComponent:listenForUserType: error ', error);
      throw new Error(error);
    });
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

  private initialize() {
    let index: number;
    let params: InewbieTopic;

    index = Math.floor(Math.random() * this.authorizedTopics.length - 1) + 1;

    this.topicID = this.authorizedTopics[index].topicID;
    this.topicDesc = this.authorizedTopics[index].topicDesc;
  }
}
