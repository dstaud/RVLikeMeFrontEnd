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
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  form: FormGroup;
  showSpinner = false;
  showAboutMeSaveIcon = false;
  showLanguageSaveIcon = false;
  aboutMeOther: string;
  aboutMeFormValue = '';

  percentPersonal: number;
  personalProgressBarColor: string;
  personalEnteredMostInfo: boolean = false;
  percentLifestyle: number;
  lifestyleProgressBarColor: string;
  lifestyleEnteredMostInfo: boolean = false;
  percentRig: number;
  rigProgressBarColor: string;
  rigEnteredMostInfo: boolean = false;
  interestsIndicator: string;
  interestsIndClass: string;

  // About me is part of lifestyle, but is duplicated here because it is so important and because I'm hoping
  // users will see it on this page and select it and see they have already made progress in filling out
  // their profile!
  AboutMes: AboutMe[] = [
    {value: '', viewValue: ''},
    {value: 'dreamer', viewValue: 'profile.component.list.aboutme.dreamer'},
    {value: 'newbie', viewValue: 'profile.component.list.aboutme.newbie'},
    {value: 'experienced', viewValue: 'profile.component.list.aboutme.experienced'},
    {value: 'other', viewValue: 'profile.component.list.aboutme.other'}
  ];

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  private backPath = '';
  private totalPersonalFieldsWithData = 0;
  private totalPersonalNbrOfFields = 8;
  private totalLifestyleFieldsWithData = 0;
  private totalLifestyleNbrOfFields = 6;

  private totalRigFieldsWithData = 0;
  private totalRigNbrOfFields = 5;


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
      console.log('ProfileComponent:ngOnInit: got new profile data=', data);
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

      if (data.firstName) { this.totalPersonalFieldsWithData++; };
      if (data.lastName) { this.totalPersonalFieldsWithData++; };
      if (data.displayName) { this.totalPersonalFieldsWithData++; };
      if (data.yearOfBirth) { this.totalPersonalFieldsWithData++; };
      if (data.homeCountry) { this.totalPersonalFieldsWithData++; };
      if (data.homeState) { this.totalPersonalFieldsWithData++; };
      if (data.gender) { this.totalPersonalFieldsWithData++; };
      if (data.myStory) { this.totalPersonalFieldsWithData++; };
      this.percentPersonal = (this.totalPersonalFieldsWithData / this.totalPersonalNbrOfFields) * 100;
      if (this.percentPersonal < 13) {
        this.personalProgressBarColor = 'warn'
      } else {
        this.personalProgressBarColor = 'primary'
      }
      if (this.percentPersonal > 74) {
        this.personalEnteredMostInfo = true;
      }

      if (data.aboutMe) { this.totalLifestyleFieldsWithData++; };
      if (data.rvUse) { this.totalLifestyleFieldsWithData++; };
      if (data.worklife) { this.totalLifestyleFieldsWithData++; };
      if (data.campsWithMe) { this.totalLifestyleFieldsWithData++; };
      if (data.boondocking) { this.totalLifestyleFieldsWithData++; };
      if (data.traveling) { this.totalLifestyleFieldsWithData++; };
      this.percentLifestyle = (this.totalLifestyleFieldsWithData / this.totalLifestyleNbrOfFields) * 100;
      if (this.percentLifestyle < 5) {
        this.lifestyleProgressBarColor = 'warn'
      } else {
        this.lifestyleProgressBarColor = 'primary'
      }
      if (this.percentLifestyle> 65) {
        this.lifestyleEnteredMostInfo = true;
      }

      if (data.rigType) { this.totalRigFieldsWithData++; };
      if (data.rigYear) { this.totalRigFieldsWithData++; };
      if (data.rigManufacturer) { this.totalRigFieldsWithData++; };
      if (data.rigBrand) { this.totalRigFieldsWithData++; };
      if (data.rigModel) { this.totalRigFieldsWithData++; };
      this.percentRig = (this.totalRigFieldsWithData / this.totalRigNbrOfFields) * 100;
      if (this.percentRig < 13) {
        this.rigProgressBarColor = 'warn'
      } else {
        this.rigProgressBarColor = 'primary'
      }
      if (this.percentRig > 49) {
        this.rigEnteredMostInfo = true;
      }

      if (data.atv || data.motorcycle || data.travel || data.quilting || data.cooking || data.painting ||
          data.blogging || data.livingFrugally || data.gaming || data.musicalInstrument || data.programming ||
          data.mobileInternet) {
        this.interestsIndicator = 'sentiment_very_satisfied';
        this.interestsIndClass = 'has-interests';
      } else {
        this.interestsIndicator = 'sentiment_dissatisfied';
        this.interestsIndClass = 'no-interests';
      }

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

  onInterests() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-interests');
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
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showAboutMeSaveIcon = false;
      // this.profileSvc.distributeProfileUpdate(this.profile);
      if (this.form.controls.aboutMe.value) {
        this.totalLifestyleFieldsWithData++;
      } else {
        this.totalLifestyleFieldsWithData--;
      }
      this.percentLifestyle = (this.totalLifestyleFieldsWithData / this.totalLifestyleNbrOfFields) * 100;
      if (this.percentLifestyle> 65) {
        this.lifestyleEnteredMostInfo = true;
      } else {
        this.lifestyleEnteredMostInfo = false;
      }
    }, error => {
      this.showAboutMeSaveIcon = false;
    });
  }
}
