import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { SharedComponent } from '@shared/shared.component';


@Component({
  selector: 'app-rvlm-likeme-counts',
  templateUrl: './likeme-counts.component.html',
  styleUrls: ['./likeme-counts.component.scss']
})
export class LikemeCountsComponent implements OnInit {
  @Input('theme') theme: string;

  form: FormGroup;
  allUsersCount: number;
  matches: boolean = false;

  aboutMe: string;
  rigType: string;
  rvUse: string;
  rigManufacturer

  showSpinner = false;
  showAllUsersCount = false;
  showAboutMe = false;
  showRigType = false;
  showRvUse = false;
  showRigManufacturer = false;

  private aboutMeCount: number;
  private rigTypeCount: number;
  private rvUseCount: number;
  private rigManufacturerCount: number;
  private likeMeDesc: string;
  private likeMeAnswer: string;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  private likeMeCounts: Observable<IlikeMeCounts>;

  constructor(private translate: TranslateService,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService,
              private router: Router,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private shared: SharedComponent) {
  }

  ngOnInit() {
    this.showSpinner = true;

    this.listenForUserProfile();

    this.listenForLikeMeCounts();
  }

  ngOnDestroy() {}


  // If user clicks on one of the displayed Like Me counts on the home page, navigate to the Connections page in context.
  onSelectLikeMeCount(clickedItem: string) {
    this.activateBackArrowSvc.setBackRoute('home/main', 'forward');
    this.router.navigate(['/connections/main'], { queryParams: { item: clickedItem }}); // NavigateByUrl has a bug and won't accept queryParams
  }


  // Listen for Like Me counts to display on the home page
  private listenForLikeMeCounts() {
    this.likeMeCounts = this.likeMeCountsSvc.likeMeCounts;
    this.likeMeCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.showSpinner = true;
      this.allUsersCount = data.allUsersCount;
      this.aboutMeCount = data.aboutMe;
      this.rigTypeCount = data.rigType;
      this.rvUseCount = data.rvUse;
      this.rigManufacturerCount = data.rigManufacturer;

      if ((this.profile.aboutMe && this.aboutMeCount > 0) ||
          (this.profile.rigType && this.rigTypeCount > 0) ||
          (this.profile.rvUse && this.rvUseCount > 0) ||
          (this.profile.rigManufacturer && this.rigManufacturerCount > 0)) {
          this.matches = true;
      } else {
        this.matches = false;
      }

      if (this.allUsersCount > 0) {
        this.showAllUsersCount = true;
        this.showSpinner = false;
      }

      if (this.profile.aboutMe && this.aboutMeCount > 0  && !this.profile.aboutMe.startsWith('@')) {
        this.showAboutMe = true;
        if (this.aboutMeCount === 1) {
          this.likeMeDesc = this.translate.instant('connections.component.aboutMe1');
        } else {
          this.likeMeDesc = this.translate.instant('connections.component.aboutMe');
        }
        this.likeMeAnswer = this.translate.instant('profile.component.list.aboutme.' + this.profile.aboutMe.toLowerCase());
        this.aboutMe = this.aboutMeCount + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer;
      }
      if (this.profile.rigType && this.rigTypeCount > 0  && !this.profile.rigType.startsWith('@')) {
        this.showRigType = true;
        if (this.rigTypeCount === 1) {
          this.likeMeDesc = this.translate.instant('connections.component.rigType1');
        } else {
          this.likeMeDesc = this.translate.instant('connections.component.rigType');
        }
        this.likeMeAnswer = this.translate.instant('profile.component.list.rigtype.' + this.profile.rigType.toLowerCase());
        this.rigType = this.rigTypeCount + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer;
      }
      if (this.profile.rvUse && this.rvUseCount > 0  && !this.profile.rvUse.startsWith('@')) {
        this.showRvUse = true;
        if (this.rvUseCount === 1) {
          this.likeMeDesc = this.translate.instant('connections.component.rvUse1');
        } else {
          this.likeMeDesc = this.translate.instant('connections.component.rvUse');
        }
        this.likeMeAnswer = this.translate.instant('profile.component.list.rvuse.' + this.profile.rvUse.toLowerCase());
        this.rvUse = this.rvUseCount + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer;
      }
      if (this.profile.rigManufacturer && this.rigManufacturerCount > 0  && !this.profile.rigManufacturer.startsWith('@')) {
        this.showRigManufacturer = true;
        if (this.rigManufacturerCount === 1) {
          this.likeMeDesc = this.translate.instant('connections.component.rigManufacturer1');
        } else {
          this.likeMeDesc = this.translate.instant('connections.component.rigManufacturer');
        }
        this.likeMeAnswer = this.profile.rigManufacturer.toLowerCase();
        this.rigManufacturer = this.rigManufacturerCount + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer;
      }

    }, (error) => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }


  // Listen for user profile and save
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;

    }, error => {
      this.sentry.logError('ProfilePercentComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
    });
  }
}
