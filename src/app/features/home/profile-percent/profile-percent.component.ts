import { Component, OnInit, OnDestroy } from '@angular/core';
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
  percentProfileComplete: number;
  percentCompleteMsg: string;
  progressBarColor: string;

  showSpinner = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private totalProfileFieldsWithData: number;
  private totalPersonalNbrOfFields = 19;


  constructor(private profileSvc: ProfileService,
              private translate: TranslateService,
              private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService) { }

  ngOnInit() {
    this.showSpinner = true;
    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in Profile component=', data);
      this.profile = data;
      this.totalProfileFieldsWithData = 0;

      if (data.firstName) {
        this.totalProfileFieldsWithData++;
        this.showSpinner = false;}
      if (data.lastName) { this.totalProfileFieldsWithData++; }
      if (data.displayName) { this.totalProfileFieldsWithData++; }
      if (data.yearOfBirth) { this.totalProfileFieldsWithData++; }
      if (data.homeCountry) { this.totalProfileFieldsWithData++; }
      if (data.homeState) { this.totalProfileFieldsWithData++; }
      if (data.gender) { this.totalProfileFieldsWithData++; }
      if (data.aboutMe) { this.totalProfileFieldsWithData++; }
      if (data.myStory) { this.totalProfileFieldsWithData++; }
      if (data.rvUse) { this.totalProfileFieldsWithData++; }
      if (data.worklife) { this.totalProfileFieldsWithData++; }
      if (data.campsWithMe) { this.totalProfileFieldsWithData++; }
      if (data.boondocking) { this.totalProfileFieldsWithData++; }
      if (data.traveling) { this.totalProfileFieldsWithData++; }
      if (data.rigType) { this.totalProfileFieldsWithData++; }
      if (data.rigYear) { this.totalProfileFieldsWithData++; }
      if (data.rigManufacturer) { this.totalProfileFieldsWithData++; }
      if (data.rigBrand) { this.totalProfileFieldsWithData++; }
      if (data.rigModel) { this.totalProfileFieldsWithData++; }
      this.percentProfileComplete = Math.round((this.totalProfileFieldsWithData / this.totalPersonalNbrOfFields) * 100);

      this.profileMessages();
    }, (error) => {
      console.error(error);
    });
  }

  ngOnDestroy() { }

  profileMessages() {
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
  onPercentProfile() {
    this.activateBackArrowSvc.setBackRoute('home');
    this.router.navigateByUrl('/profile');
  }
}
