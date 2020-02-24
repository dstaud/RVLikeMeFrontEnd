import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { LanguageService } from '@services/language.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';

export interface AboutMe {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: IuserProfile = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: null,
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null,
    rigType: null,
    rigManufacturer: null,
    rigBrand: null,
    rigModel: null,
    rigYear: null
  };

  userProfile: Observable<IuserProfile>;

  showSpinner = false;
  showAboutMeSaveIcon = false;
  showLanguageSaveIcon = false;
  backPath = '';
  totalPersonalFieldsWithData = 0;
  totalPersonalNbrOfFields = 6;
  percentPersonal: number;
  totalLifestyleFieldsWithData = 0;
  totalLifestyleNbrOfFields = 5;
  percentLifestyle: number;
  totalRigFieldsWithData = 0;
  totalRigNbrOfFields = 1;
  percentRig: number;
  aboutMeOther: string;
  form: FormGroup;
  aboutMeFormValue = '';

  AboutMes: AboutMe[] = [
    {value: '', viewValue: ''},
    {value: 'dreamer', viewValue: 'profile.component.list.aboutMe.dreamer'},
    {value: 'newbie', viewValue: 'profile.component.list.aboutMe.newbie'},
    {value: 'experienced', viewValue: 'profile.component.list.aboutMe.experienced'},
    {value: 'other', viewValue: 'profile.component.list.aboutMe.other'}
  ];


  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
      $event.returnValue = true;
    }


  constructor(private authSvc: AuthenticationService,
              private translate: TranslateService,
              private profileSvc: ProfileService,
              private location: Location,
              private language: LanguageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private dialog: MatDialog,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  language: ['en', Validators.required],
                  aboutMe: ['']
                });
            }

  ngOnInit() {
    this.form.disable();
    this.showSpinner = true;
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in Profile component=', data);
      this.profile = data;
      this.totalPersonalFieldsWithData = 0;
      this.totalLifestyleFieldsWithData = 0;
      this.totalRigFieldsWithData = 0;

      if (this.profile.aboutMe) {
        if (this.profile.aboutMe.substring(0, 1) === '@') {
          this.aboutMeOther = this.profile.aboutMe.substring(1, this.profile.aboutMe.length);
          this.aboutMeFormValue = 'other';
        } else {
          this.aboutMeFormValue = this.profile.aboutMe;
        }
      }

      this.form.patchValue ({
        language: data.language,
        aboutMe: this.aboutMeFormValue
      });

      if (data.firstName) { this.totalPersonalFieldsWithData++; }
      if (data.lastName) { this.totalPersonalFieldsWithData++; }
      if (data.displayName) { this.totalPersonalFieldsWithData++; }
      if (data.yearOfBirth) { this.totalPersonalFieldsWithData++; }
      if (data.homeCountry) { this.totalPersonalFieldsWithData++; }
      if (data.homeState) { this.totalPersonalFieldsWithData++; }
      this.percentPersonal = (this.totalPersonalFieldsWithData / this.totalPersonalNbrOfFields) * 100;

      if (data.rvUse) { this.totalLifestyleFieldsWithData++; }
      if (data.worklife) { this.totalLifestyleFieldsWithData++; }
      if (data.campsWithMe) { this.totalLifestyleFieldsWithData++; }
      if (data.boondocking) { this.totalLifestyleFieldsWithData++; }
      if (data.traveling) { this.totalLifestyleFieldsWithData++; }
      this.percentLifestyle = (this.totalLifestyleFieldsWithData / this.totalLifestyleNbrOfFields) * 100;


      if (data.rigType) { this.totalRigFieldsWithData++; }
      this.percentRig = (this.totalRigFieldsWithData / this.totalRigNbrOfFields) * 100;

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
   }

   ngOnDestroy() { }

  // If use touches aboutMe control and had previously selected 'other' then open the dialog to show what they had entered.
  activatedAboutMe() {
    if (this.aboutMeOther) {
      this.openDialog('other');
    }
  }


  /**** Route to sub-profile pages as user selects ****/
  onPersonal() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-personal');
  }

  onLifestyle() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-lifestyle');
  }

  onRig() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-rig');
  }


  // Wen user selects 'other' open dialog to collect data
  openDialog(event: string): void {
    let other = '';
    let selection = null;
    if (this.aboutMeOther) {
      other = this.aboutMeOther;
    }
    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: 'profile.component.aboutMe', other: other }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) {
        if (this.aboutMeOther !== result && result !== 'canceled') {
          this.aboutMeOther = result;
          this.profile.aboutMe = '@' + result;
          this.updateAboutMe(event);
        }
      } else {
        if (this.aboutMeOther) {
          this.profile.aboutMe = null;
          this.updateAboutMe('');
          this.aboutMeOther = '';
          this.form.patchValue({
            aboutMe: null
          });
        } else {
          if (this.profile.aboutMe) {
            selection = this.profile.aboutMe;
          }
          this.form.patchValue({
            aboutMe: selection
          });
        }
      }
    });
  }


  // On user selection of Other from aboutMe control, open dialog to collection information. If not other, update database.
  selectedAboutMe(event: string) {
    if (event === 'other') {
      this.openDialog(event);
    } else {
      this.aboutMeOther = '';
      this.updateAboutMe(event);
    }
  }


  // Set language based on user selection and store in database
  setLanguage(entry: string) {
    this.showLanguageSaveIcon = true;
    this.profile.language = this.form.controls.language.value;
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showLanguageSaveIcon = false;
      this.language.setLanguage(entry);
    }, error => {
      this.showLanguageSaveIcon = false;
    });
  }


  // Auto-update aboutMe selection to server
  updateAboutMe(event: string) {
    console.log('updating profile ', this.profile);
    if (this.form.controls.aboutMe.value === '') {
      this.profile.aboutMe = null;
      this.form.patchValue({
        aboutMe: null
      });
    } else {
      if (this.form.controls.aboutMe.value !== 'other') {
        this.profile.aboutMe = this.form.controls.aboutMe.value;
      }
    }
    this.showAboutMeSaveIcon = true;
    console.log('calling updateProfile:', this.profile);
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showAboutMeSaveIcon = false;
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this.showAboutMeSaveIcon = false;
    });
  }
}
