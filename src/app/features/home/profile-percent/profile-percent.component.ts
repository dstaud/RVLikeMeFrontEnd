import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-profile-percent',
  templateUrl: './profile-percent.component.html',
  styleUrls: ['./profile-percent.component.scss']
})
export class ProfilePercentComponent implements OnInit {
  @Input('theme') theme: string;

  percentProfileComplete: number;
  percentCompleteMsg: string;
  progressBarColor: string;
  profile: IuserProfile;

  showSpinner = false;

  private userProfile: Observable<IuserProfile>;
  private totalProfileFieldsWithData: number;
  private totalPersonalNbrOfFields = 18;


  constructor(private profileSvc: ProfileService,
              private translate: TranslateService,
              private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService) {
  }

  ngOnInit() {
    this.showSpinner = true;
    this.userProfile = this.profileSvc.profile;

    this.listenForUserProfile();
  }

  ngOnDestroy() { }


  onPercentProfile() {
    this.activateBackArrowSvc.setBackRoute('home/dashboard');
    this.router.navigateByUrl('/profile/main');
  }


  // Listen for user profile and take action
  private listenForUserProfile() {
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;
      this.totalProfileFieldsWithData = 0;

      if (profileResult.firstName) {
        this.totalProfileFieldsWithData++;
        this.showSpinner = false;}
      if (profileResult.lastName) { this.totalProfileFieldsWithData++; }
      if (profileResult.displayName) { this.totalProfileFieldsWithData++; }
      if (profileResult.yearOfBirth) { this.totalProfileFieldsWithData++; }
      if (profileResult.homeCountry) { this.totalProfileFieldsWithData++; }
      if (profileResult.homeState) { this.totalProfileFieldsWithData++; }
      if (profileResult.gender) { this.totalProfileFieldsWithData++; }
      if (profileResult.aboutMe) { this.totalProfileFieldsWithData++; }
      if (profileResult.myStory) { this.totalProfileFieldsWithData++; }
      if (profileResult.rvUse) { this.totalProfileFieldsWithData++; }
      if (profileResult.worklife) { this.totalProfileFieldsWithData++; }
      if (profileResult.campsWithMe) { this.totalProfileFieldsWithData++; }
      if (profileResult.boondocking) { this.totalProfileFieldsWithData++; }
      if (profileResult.traveling) { this.totalProfileFieldsWithData++; }
      if (profileResult.rigType) { this.totalProfileFieldsWithData++; }
      if (profileResult.rigYear) { this.totalProfileFieldsWithData++; }
      if (profileResult.rigBrand) { this.totalProfileFieldsWithData++; }
      if (profileResult.rigModel) { this.totalProfileFieldsWithData++; }
      this.percentProfileComplete = Math.round((this.totalProfileFieldsWithData / this.totalPersonalNbrOfFields) * 100);

      this.determineProfileMessages();
    }, error => {
      console.error('ProfilePercentComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  // Based on % complete, set the appropriate user message and color-coding
  private determineProfileMessages() {
    if (this.percentProfileComplete < 6) {
      this.percentCompleteMsg = this.translate.instant('home.component.progressBar0');
      this.progressBarColor = 'warn';
    }
    if (this.percentProfileComplete > 5 && this.percentProfileComplete < 20) {
      this.percentCompleteMsg = this.translate.instant('home.component.progressBar5');
      this.progressBarColor = 'warn';
    }
    if (this.percentProfileComplete > 19 && this.percentProfileComplete < 40) {
      this.percentCompleteMsg = this.translate.instant('home.component.progressBar20');
      this.progressBarColor = 'primary';
    }
    if (this.percentProfileComplete > 39 && this. percentProfileComplete < 50) {
      this.percentCompleteMsg = this.translate.instant('home.component.progressBar40');
      this.progressBarColor = 'primary';
    }
    if (this.percentProfileComplete > 49 && this. percentProfileComplete < 75) {
      this.percentCompleteMsg = this.translate.instant('home.component.progressBar50');
      this.progressBarColor = 'primary';
    }
    if (this.percentProfileComplete > 74) {
      this.percentCompleteMsg = this.translate.instant('home.component.progressBar75');
      this.progressBarColor = 'primary';
    }
  }
}
