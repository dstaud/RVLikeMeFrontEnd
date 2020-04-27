import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

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

  private userProfile: Observable<IuserProfile>;

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private profileSvc: ProfileService,
              private route: ActivatedRoute,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
    this.listenForUserProfile();

    let params = JSON.parse(this.shareDataSvc.getData());
    this.topicID = params.topicID;
    this.topicDesc = params.topicDesc;
    this.title = 'newbie-topics.component.' + this.topicID;
    this.header = 'newbie-topics.component.' + this.topicID + 'Header';
  }

  ngOnDestroy() {}


  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/topic');
    params = '{"forumType":"topic","topicID":"' + this.topicID + '","topicDesc":"' + this.topicDesc + '" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }

  onLinkAdded(event: any) {
    console.log('SuggestTopicComponent:onLinkAdded: =', event);
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
}
