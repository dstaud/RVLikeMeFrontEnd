import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { LanguageService } from '@services/language.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService } from '@services/share-data.service';

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

  showSpinner = false;
  showAboutMeSaveIcon = false;
  showLanguageSaveIcon = false;

  // TODO: Store the attribute data in database or in code?
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

  private aboutMeOther: string;
  private aboutMeFormValue = '';

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  private backPath = '';
  private totalLifestyleFieldsWithData = 0;
  private totalLifestyleNbrOfFields = 6;

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }


  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private location: Location,
              private language: LanguageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private dialog: MatDialog,
              private shareDataSvc: ShareDataService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  language: ['en', Validators.required],
                  aboutMe: ['']
                });
            }

  ngOnInit() {
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.form.disable();
    this.showSpinner = true;

    this.listenForUserProfile();
   }

   ngOnDestroy() { }

  // If use touches aboutMe control and had previously selected 'other' then open the dialog to show what they had entered.
  activatedAboutMe() {
    if (this.aboutMeOther) {
      this.openOtherDialog('other');
    }
  }


  /**** Route to sub-profile pages as user selects ****/
  onInterests() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-interests');
  }

  onLifestyle() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-lifestyle');
  }

  onPersonal() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-personal');
  }

  onRig() {
    this.activateBackArrowSvc.setBackRoute('profile');
    this.router.navigateByUrl('/profile-rig');
  }

  // View your story as other users will see it
  onYourStory() {
    let userParams = this.packageParamsForMessaging();
    let params = '{"userID":"' + this.profile.userID + '",' +
                      '"userIdViewer":"' + this.profile.userID + '",' +
                      '"params":' + userParams + '}';
    console.log('ProfileComponent:onYourStory: params=', params);
    this.activateBackArrowSvc.setBackRoute('profile');
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/mystory');
  }

  // On user selection of Other from aboutMe control, open dialog to collection information. If not other, update database.
  onSelectedAboutMe(event: string) {
    if (event === 'other') {
      this.openOtherDialog(event);
    } else {
      this.aboutMeOther = '';
      this.updateAboutMe(event);
    }
  }


  // Set language based on user selection and store in database
  onSetLanguage(entry: string) {
    this.showLanguageSaveIcon = true;
    this.profile.language = this.form.controls.language.value;
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.showLanguageSaveIcon = false;
      this.language.setLanguage(entry);
    }, error => {
      this.showLanguageSaveIcon = false;
      console.log('ProfileComponent:setLanguage: throw error ', error);
      throw new Error(error);
    });
  }


  // Determine the percent complete for each type of data in the form and display appropriate data
  private determinePercentComplete(profile) {
    let totalPersonalFieldsWithData = 0;
    let totalPersonalNbrOfFields = 8;

    let totalRigFieldsWithData = 0;
    let totalRigNbrOfFields = 5;
    totalPersonalFieldsWithData = 0;
    this.totalLifestyleFieldsWithData = 0;
    totalRigFieldsWithData = 0;

    // Personal data
    if (profile.firstName) { totalPersonalFieldsWithData++; };
    if (profile.lastName) { totalPersonalFieldsWithData++; };
    if (profile.displayName) { totalPersonalFieldsWithData++; };
    if (profile.yearOfBirth) { totalPersonalFieldsWithData++; };
    if (profile.homeCountry) { totalPersonalFieldsWithData++; };
    if (profile.homeState) { totalPersonalFieldsWithData++; };
    if (profile.gender) { totalPersonalFieldsWithData++; };
    if (profile.myStory) { totalPersonalFieldsWithData++; };
    this.percentPersonal = (totalPersonalFieldsWithData / totalPersonalNbrOfFields) * 100;
    if (this.percentPersonal < 13) {
      this.personalProgressBarColor = 'warn'
    } else {
      this.personalProgressBarColor = 'primary'
    }
    if (this.percentPersonal > 74) {
      this.personalEnteredMostInfo = true;
    }

    // Lifestyle data
    if (profile.aboutMe) { this.totalLifestyleFieldsWithData++; };
    if (profile.rvUse) { this.totalLifestyleFieldsWithData++; };
    if (profile.worklife) { this.totalLifestyleFieldsWithData++; };
    if (profile.campsWithMe) { this.totalLifestyleFieldsWithData++; };
    if (profile.boondocking) { this.totalLifestyleFieldsWithData++; };
    if (profile.traveling) { this.totalLifestyleFieldsWithData++; };
    this.percentLifestyle = (this.totalLifestyleFieldsWithData / this.totalLifestyleNbrOfFields) * 100;
    if (this.percentLifestyle < 5) {
      this.lifestyleProgressBarColor = 'warn'
    } else {
      this.lifestyleProgressBarColor = 'primary'
    }
    if (this.percentLifestyle> 65) {
      this.lifestyleEnteredMostInfo = true;
    }

    // Rig data
    if (profile.rigType) { totalRigFieldsWithData++; };
    if (profile.rigYear) { totalRigFieldsWithData++; };
    if (profile.rigManufacturer) { totalRigFieldsWithData++; };
    if (profile.rigBrand) { totalRigFieldsWithData++; };
    if (profile.rigModel) { totalRigFieldsWithData++; };
    this.percentRig = (totalRigFieldsWithData / totalRigNbrOfFields) * 100;
    if (this.percentRig < 13) {
      this.rigProgressBarColor = 'warn'
    } else {
      this.rigProgressBarColor = 'primary'
    }
    if (this.percentRig > 49) {
      this.rigEnteredMostInfo = true;
    }

    // Interests Data
    if (profile.atv || profile.motorcycle || profile.travel || profile.quilting || profile.cooking || profile.painting ||
        profile.blogging || profile.livingFrugally || profile.gaming || profile.musicalInstrument || profile.programming ||
        profile.mobileInternet) {
      this.interestsIndicator = 'sentiment_very_satisfied';
      this.interestsIndClass = 'has-interests';
    } else {
      this.interestsIndicator = 'sentiment_dissatisfied';
      this.interestsIndClass = 'no-interests';
    }
  }


  // Listen for profile data and then take actions based on that data
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      console.log('ProfileComponent:ngOnInit: got new profile data=', profileResult);
      this.profile = profileResult;

      this.readyAboutMeFormFieldData();

      this.form.patchValue ({
        language: profileResult.language,
        aboutMe: this.aboutMeFormValue
      });

      this.determinePercentComplete(profileResult);

      this.showSpinner = false;

      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error('ProfileComponent:listenForUserProfile: error saving new profile ', error);
      throw new Error(error);
    });
  }


  // When user selects 'other' open dialog to collect data
  private openOtherDialog(event: string): void {
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


  private packageParamsForMessaging(): string {
    let params: string;
    console.log('ProfileComponent:navigateToMessages: displayName=', this.profile.displayName);
    params = '{"fromUserID":"' + this.profile.userID + '",' +
              '"fromDisplayName":"' + this.profile.displayName + '",' +
              '"fromProfileImageUrl":"' + this.profile.profileImageUrl + '",' +
              '"toUserID":"' + '' + '",' +
              '"toDisplayName":"' + '' + '",' +
              '"toProfileImageUrl":"' + '' + '"}';

    console.log('PostsComponent:navigateToMessages: params=', params);
    return params;
  }


  // If user had previously selected 'other', then make set up data for correct display
  private readyAboutMeFormFieldData() {
    if (this.profile.aboutMe) {
      if (this.profile.aboutMe.substring(0, 1) === '@') {
        this.aboutMeOther = this.profile.aboutMe.substring(1, this.profile.aboutMe.length);
        this.aboutMeFormValue = 'other';
      } else {
        this.aboutMeFormValue = this.profile.aboutMe;
      }
    }
  }


  // Auto-update aboutMe selection to server
  private updateAboutMe(event: string) {
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
      console.log('ProfileComponent:updateAboutMe: throw error ', error);
      throw new Error(error);
    });
  }
}
