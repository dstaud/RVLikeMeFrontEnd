import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';


@Component({
  selector: 'app-rvlm-likeme-counts',
  templateUrl: './likeme-counts.component.html',
  styleUrls: ['./likeme-counts.component.scss']
})
export class LikemeCountsComponent implements OnInit {
  allUsersCount: number;
  aboutMeCount: number;
  aboutMe: string;
  showAboutMe: boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  private likeMeCounts: Observable<IlikeMeCounts>;

  constructor(private translate: TranslateService,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService) { }

  ngOnInit() {
    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in like me component=', data);
      this.profile = data;
    });

    this.likeMeCounts = this.likeMeCountsSvc.likeMeCounts;

    this.likeMeCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.allUsersCount = data.allUsersCount;
      this.aboutMeCount = data.aboutMeCount;
      this.aboutMe = 'profile.component.list.aboutMe.' + this.profile.aboutMe;
      console.log('Counts=', data);
      if (this.profile.aboutMe && this.aboutMeCount > 0) {
        this.showAboutMe = true;
      }
    });
  }

  ngOnDestroy() {}
}
