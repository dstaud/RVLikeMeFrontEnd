import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { SharedComponent } from '@shared/shared.component';


@Component({
  selector: 'app-rvlm-likeme-counts',
  templateUrl: './likeme-counts.component.html',
  styleUrls: ['./likeme-counts.component.scss']
})
export class LikemeCountsComponent implements OnInit {
  allUsersCount: number;
  aboutMeCount: number;
  rigTypeCount: number;
  rvUseCount: number;
  aboutMe: string;
  rigType: string;
  rvUse: string;
  showAllUsersCount: boolean = false;
  showAboutMe: boolean = false;
  showRigType: boolean = false;
  showRvUse: boolean = false;
  // showEarlyAdopter: boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  private likeMeCounts: Observable<IlikeMeCounts>;

  constructor(private translate: TranslateService,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService,
              private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shared: SharedComponent) { }

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
      this.aboutMeCount = data.aboutMe;
      this.rigTypeCount = data.rigType;
      this.rvUseCount = data.rvUse;
      console.log('Counts=', data);
      console.log('users=', this.allUsersCount);
      if (this.allUsersCount > 0) {
        this.showAllUsersCount = true;
        if (this.allUsersCount < 100) {
          this.shared.openSnackBar(this.translate.instant('home.component.earlyAdopter'), 'message', 2000);
        }
      }

      if (this.profile.aboutMe && this.aboutMeCount > 0) {
        this.showAboutMe = true;
        this.aboutMe = 'profile.component.list.aboutMe.' + this.profile.aboutMe;
      }
      if (this.profile.rigType && this.rigTypeCount > 0) {
        this.showRigType = true;
        this.rigType = 'rig.component.list.rigtype.' + this.profile.rigType.toLowerCase();
      }
      if (this.profile.rvUse && this.rvUseCount > 0) {
        this.showRvUse = true;
        this.rvUse = 'lifestyle.component.list.rvuse.' + this.profile.rvUse.toLowerCase();
      }
    });
  }

  ngOnDestroy() {}

  onClick() {
    this.activateBackArrowSvc.setBackRoute('home');
    this.router.navigateByUrl('/connections');
  }
}
