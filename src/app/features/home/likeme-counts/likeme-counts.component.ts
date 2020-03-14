import { FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
  form: FormGroup;
  allUsersCount: number;
  aboutMeCount: number;
  rigTypeCount: number;
  rvUseCount: number;
  aboutMe: string;
  rigType: string;
  rvUse: string;

  showSpinner = false;
  showAllUsersCount = false;
  showAboutMe = false;
  showRigType = false;
  showRvUse = false;

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
      this.showSpinner = true;
      this.allUsersCount = data.allUsersCount;
      this.aboutMeCount = data.aboutMe;
      this.rigTypeCount = data.rigType;
      this.rvUseCount = data.rvUse;
      console.log('Counts=', data);
      console.log('users=', this.allUsersCount);
      if (this.allUsersCount > 0) {
        this.showAllUsersCount = true;
        this.showSpinner = false;
      }

      if (this.profile.aboutMe && this.aboutMeCount > 0  && this.profile.aboutMe.substring(0, 1) !== '@') {
        this.showAboutMe = true;
        this.aboutMe = 'profile.component.list.aboutme.' + this.profile.aboutMe;
      }
      if (this.profile.rigType && this.rigTypeCount > 0  && this.profile.rigType.substring(0, 1) !== '@') {
        this.showRigType = true;
        this.rigType = 'profile.component.list.rigtype.' + this.profile.rigType.toLowerCase();
      }
      if (this.profile.rvUse && this.rvUseCount > 0  && this.profile.rvUse.substring(0, 1) !== '@') {
        this.showRvUse = true;
        this.rvUse = 'profile.component.list.rvuse.' + this.profile.rvUse.toLowerCase();
      }
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
  }

  ngOnDestroy() {}

  onClick(clickedItem: string) {
    this.activateBackArrowSvc.setBackRoute('home');
    this.router.navigate(['/connections'], { queryParams: { item: clickedItem }}); // NavigateByUrl has a but and won't accept queryParams
  }
}
