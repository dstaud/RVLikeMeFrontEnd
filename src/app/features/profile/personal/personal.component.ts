import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { ShareDataService, IprofileImage } from '@services/share-data.service';
import { DeviceService } from '@services/device.service';
import { ThemeService } from '@services/theme.service';

import { ImageDialogComponent } from '@dialogs/image-dialog/image-dialog.component';
import { SharedComponent } from '@shared/shared.component';

/**** Interfaces for data for form selects ****/
export interface Gender {
  value: string;
  viewValue: string;
}

export interface Country {
  value: string;
  viewValue: string;
}

export interface State {
  value: string;
  viewValue: string;
}

/* This component allows users to enter personal information about themselves.
I decided to implement auto-save in all large forms where changes are saved as user leaves the field.
It's possible this will be too noisy with internet traffic.  If that's the case, can move to save locally and submit at once,
but don't want to go to a Submit button model because that isn't very app-like and because I populate the form from the database
on-load, it's always dirty and marking pristine doesn't help.  This means route-guards won't work so user might leave form
and I can't notify them. */

@Component({
  selector: 'app-rvlm-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})

export class PersonalComponent implements OnInit {
  form: FormGroup;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  profileImageLabel = 'personal.component.addProfilePic';
  tempProfileImage: string;
  containerDialog: boolean = false;
  theme: string;

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showfirstNameSaveIcon = false;
  showlastNameSaveIcon = false;
  showdisplayNameSaveIcon = false;
  showyearOfBirthSaveIcon = false;
  showhomeCountrySaveIcon = false;
  showhomeStateSaveIcon = false;
  showgenderSaveIcon = false;
  showmyStorySaveIcon = false;
  showprofileImageSaveIcon = true;

  /**** Select form select field option data. ****/
  Genders: Gender[] = [
    {value: '', viewValue: ''},
    {value: 'M', viewValue: 'profile.component.list.gender.m'},
    {value: 'F', viewValue: 'profile.component.list.gender.f'}
  ];

  Countries: Country[] = [
    {value: '', viewValue: ''},
    {value: 'USA', viewValue: 'profile.component.list.homecountry.usa'},
    {value: 'CAN', viewValue: 'profile.component.list.homecountry.can'}
  ];

  States: State[] = [
    {value: '', viewValue: ''},
    {value: 'AL', viewValue: 'profile.component.list.homestate.al'},
    {value: 'AK', viewValue: 'profile.component.list.homestate.ak'},
    {value: 'AZ', viewValue: 'profile.component.list.homestate.az'},
    {value: 'AR', viewValue: 'profile.component.list.homestate.ar'},
    {value: 'CA', viewValue: 'profile.component.list.homestate.ca'},
    {value: 'CO', viewValue: 'profile.component.list.homestate.co'},
    {value: 'CT', viewValue: 'profile.component.list.homestate.ct'},
    {value: 'DE', viewValue: 'profile.component.list.homestate.de'},
    {value: 'DC', viewValue: 'profile.component.list.homestate.dc'},
    {value: 'FL', viewValue: 'profile.component.list.homestate.fl'},
    {value: 'GA', viewValue: 'profile.component.list.homestate.ga'},
    {value: 'HI', viewValue: 'profile.component.list.homestate.hi'},
    {value: 'ID', viewValue: 'profile.component.list.homestate.id'},
    {value: 'IL', viewValue: 'profile.component.list.homestate.il'},
    {value: 'IN', viewValue: 'profile.component.list.homestate.in'},
    {value: 'IA', viewValue: 'profile.component.list.homestate.ia'},
    {value: 'KS', viewValue: 'profile.component.list.homestate.ks'},
    {value: 'KY', viewValue: 'profile.component.list.homestate.ky'},
    {value: 'LA', viewValue: 'profile.component.list.homestate.la'},
    {value: 'ME', viewValue: 'profile.component.list.homestate.me'},
    {value: 'MD', viewValue: 'profile.component.list.homestate.md'},
    {value: 'MA', viewValue: 'profile.component.list.homestate.ma'},
    {value: 'MI', viewValue: 'profile.component.list.homestate.mi'},
    {value: 'MN', viewValue: 'profile.component.list.homestate.mn'},
    {value: 'MS', viewValue: 'profile.component.list.homestate.ms'},
    {value: 'MO', viewValue: 'profile.component.list.homestate.mo'},
    {value: 'MT', viewValue: 'profile.component.list.homestate.mt'},
    {value: 'NE', viewValue: 'profile.component.list.homestate.ne'},
    {value: 'NV', viewValue: 'profile.component.list.homestate.nv'},
    {value: 'NH', viewValue: 'profile.component.list.homestate.nh'},
    {value: 'NJ', viewValue: 'profile.component.list.homestate.nj'},
    {value: 'NM', viewValue: 'profile.component.list.homestate.nm'},
    {value: 'NY', viewValue: 'profile.component.list.homestate.ny'},
    {value: 'NC', viewValue: 'profile.component.list.homestate.nc'},
    {value: 'ND', viewValue: 'profile.component.list.homestate.nd'},
    {value: 'OH', viewValue: 'profile.component.list.homestate.oh'},
    {value: 'OK', viewValue: 'profile.component.list.homestate.ok'},
    {value: 'OR', viewValue: 'profile.component.list.homestate.or'},
    {value: 'PA', viewValue: 'profile.component.list.homestate.pa'},
    {value: 'SC', viewValue: 'profile.component.list.homestate.sc'},
    {value: 'SD', viewValue: 'profile.component.list.homestate.sd'},
    {value: 'TN', viewValue: 'profile.component.list.homestate.tn'},
    {value: 'TX', viewValue: 'profile.component.list.homestate.tx'},
    {value: 'UT', viewValue: 'profile.component.list.homestate.ut'},
    {value: 'VT', viewValue: 'profile.component.list.homestate.vt'},
    {value: 'VA', viewValue: 'profile.component.list.homestate.va'},
    {value: 'WA', viewValue: 'profile.component.list.homestate.wa'},
    {value: 'WV', viewValue: 'profile.component.list.homestate.wv'},
    {value: 'WI', viewValue: 'profile.component.list.homestate.wi'},
    {value: 'WY', viewValue: 'profile.component.list.homestate.wy'}
    ];


  private windowWidth: any;
  private dialogWidth: number;
  private dialogWidthDisplay: string;
  private desktopMaxWidth: number;

  // Interface for Profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private returnRoute: string;

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   $event.returnValue = true;
  // }

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private router: Router,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private dialog: MatDialog,
              private themeSvc: ThemeService,
              private sharedDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private shared: SharedComponent,
              private uploadImageSvc: UploadImageService,
              private device: DeviceService,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                // lastName: new FormControl(''),
                displayName: new FormControl('', Validators.required),
                yearOfBirth: new FormControl('',
                                              [Validators.minLength(4),
                                               Validators.maxLength(4),
                                               this.yearOfBirthValidator]),
                gender: new FormControl(''),
                homeCountry: new FormControl(''),
                homeState: new FormControl(''),
                myStory: new FormControl(''),
                profileImage: new FormControl(''),
                linkDesc1: new FormControl(''),
                link1: new FormControl(''),
                linkDesc2: new FormControl(''),
                link2: new FormControl(''),
                linkDesc3: new FormControl(''),
                link3: new FormControl('')
              },
                { updateOn: 'blur' }
              );
    }

  ngOnInit() {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (window.innerWidth > 600) {
      this.containerDialog = true;
    }

    this.setReturnRoute();

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {

      this.form.disable();

      this.showSpinner = true;

      this.listenForUserProfile();

      this.listenForColorTheme();
    }
  }

  ngOnDestroy() {};


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }

  onBack() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl(route);
  }


  onBottomBack() {
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl('/profile/main');
  }


  // When user opts to upload an image compress and upload to server and update the profile with new URL
  onProfileImageSelected(event: any) {
    let fileType: string = 'profile';

    if (event.target.files[0]) {
      this.showSpinner = true;
      this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
        this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
          if (uploadedFileUrl === 'error') {
            this.shared.openSnackBar('There was a problem uploading your photo.  It is likely too large.','error',5000);
            this.showSpinner = false;
            this.tempProfileImage = '';
          } else {
            this.tempProfileImage = uploadedFileUrl;
            this.showSpinner = false;
            // this.openImageCropperDialog(uploadedFileUrl, 'profile');
            let imageData: IprofileImage = {
              profileID: this.profile._id,
              imageSource: uploadedFileUrl
            }
            this.sharedDataSvc.setData('profileImage', imageData);

            if (this.containerDialog) {
              this.openImageCropperDialog(uploadedFileUrl)
            } else {
              this.activateBackArrowSvc.setBackRoute('profile/personal', 'forward');
              this.router.navigateByUrl('/profile/profile-image');
            }
          }
        });
      });
    }
  }


  /**** Field auto-update processing ****/
  onUpdateDataPoint(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (this.form.controls[control].value === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = this.form.controls[control].value;
    }
    this.updatePersonal(control, this.profile[control]);
  }


  onUpdateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = event;
    }
    this.updatePersonal(control, this.profile[control]);
  }


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError({"message":"unable to listen for color theme","error":error});
    });
  }



  // Listen for user profile and then take action
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;
      if (profileResult) {
        if (!profileResult.displayName) { this.profile.displayName = this.profile.firstName }
        this.form.patchValue ({
          firstName: this.profile.firstName,
          // lastName: this.profile.lastName,
          displayName: this.profile.displayName,
          yearOfBirth: this.profile.yearOfBirth,
          gender: this.profile.gender,
          homeCountry: this.profile.homeCountry,
          homeState: this.profile.homeState,
          myStory: this.profile.myStory
        });
        if (profileResult.profileImageUrl) {
          this.profileImageUrl = profileResult.profileImageUrl;
          this.profileImageLabel = 'personal.component.changeProfilePic'
        }
      }
      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      this.sentry.logError('PersonalComponent:listenForUserProfile: error getting profile=' + error);
    });
  }

  // TODO: can we feed the compressed file directly to image cropper without having to save temp image on S3 and then delete it?

  // Present image for user to crop
  private openImageCropperDialog(imageSource: string): void {
    let croppedImageBase64: string;
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      this.showSpinner = false;
    });
  }


  private setReturnRoute() {
    let returnStack: Array<string> = [];
    let i: number;

    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      returnStack = data;
      i = returnStack.length - 1;
      if (returnStack.length > 0) {
        if (returnStack[i].substring(0, 1) === '*') {
            this.returnRoute = returnStack[i].substring(1, returnStack[i].length);
        } else {
          this.returnRoute = returnStack[i];
        }
      } else {
          this.returnRoute = '';
      }
    }, error => {
      this.sentry.logError('YourStoryComponent:setReturnRoute: error setting return route=' + error);
    });
  }

  // Update data in profile document on database
  private updatePersonal(control: string, value: any) {
    let SaveIcon = 'show' + control + 'SaveIcon';

    this.profileSvc.updateProfileAttribute(this.profile._id, control, value)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      this.profileSvc.distributeProfileUpdate(responseData);
    }, error => {
      this[SaveIcon] = false;
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }


  // Validate year of birth entered is a number
  private yearOfBirthValidator(control: AbstractControl): {[key: string]: boolean} | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      return { birthYear: true };
    }
    return null;
  }
}
