import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService, IforumsMain } from '@services/share-data.service';
import { UserTypeService } from '@services/user-type.service';

@Component({
  selector: 'app-rvlm-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  profile: IuserProfile;
  topicID: string;
  topicDesc: string;
  title: string;
  header: string;
  userType: string;

  private userProfile: Observable<IuserProfile>;

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private profileSvc: ProfileService,
              private route: ActivatedRoute,
              private router: Router,
              private userTypeSvc: UserTypeService,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
    this.listenForUserProfile();

    this.listenForUserType();
  }

  ngOnDestroy() {}


  onGroup() {
    let params:IforumsMain = {
      forumType: 'topic',
      topicID: this.topicID,
      topicDesc: this.topicDesc
    }

    this.activateBackArrowSvc.setBackRoute('newbie/topic', 'forward');
    this.shareDataSvc.setData('forumsMain', params);
    this.router.navigateByUrl('/forums/main');
  }

  onLinkAdded(event: any) {
    console.log('TopicComponent:onLinkAdded: =', event);
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


  private listenForUserType() {
    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;

      if (!this.shareDataSvc.getData('newbieTopic').topicID) {
        if (type = 'expert') {
          this.router.navigateByUrl('/newbie/help-newbie');
        } else {
          this.router.navigateByUrl('/newbie/need-help-newbie');
        }
      }

      let params = this.shareDataSvc.getData('newbieTopic');
      this.topicID = params.topicID;
      this.topicDesc = params.topicDesc;

      this.title = 'newbie-topics.component.' + this.topicID;
      if (type === 'expert') {
        this.header = 'newbie-topics.component.' + this.topicID + 'HeaderExpert';
      } else {
        this.header = 'newbie-topics.component.' + this.topicID + 'HeaderNewbie';
      }

    }, error => {
      console.error('TopicComponent:listenForUserType: error ', error);
      throw new Error(error);
    });
  }
}
