import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';

import { ImageDialogComponent } from '@dialogs/image-dialog/image-dialog.component';
import { MyStoryDialogComponent } from '@dialogs/my-story-dialog/my-story-dialog.component';

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
  backPath: string;
  helpMsg = '';
  profileImageUploaded:File = null;
  profileImageUpdated: any;
  profileImageTempUrl = './../../../../assets/images/no-profile-pic.jpg';
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  profileImageLabel = 'personal.component.addProfilePic';
  profileCompressedImage:File = null;
  imgResultBeforeCompress: string;
  imgResultAfterCompress: string;
  localUrl: any;
  sizeOfOriginalImage: number;
  localCompressedURl: any;
  sizeOFCompressedImage:number;
  private windowWidth: any;
  private dialogWidth: number;
  private dialogWidthDisplay: string;

  // Interface for Profile data
  profile: IuserProfile;

  userProfile: Observable<IuserProfile>;


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

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > 1140) {
        this.dialogWidth = 1140 * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }
  }

  constructor(private translate: TranslateService,
              private shared: SharedComponent,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private router: Router,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private dialog: MatDialog,
              private uploadImageSvc: UploadImageService,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                lastName: new FormControl(''),
                displayName: new FormControl('', Validators.required),
                yearOfBirth: new FormControl('',
                                              [Validators.minLength(4),
                                               Validators.maxLength(4),
                                               this.yearOfBirthValidator]),
                gender: new FormControl(''),
                homeCountry: new FormControl(''),
                homeState: new FormControl(''),
                myStory: new FormControl(''),
                profileImage: new FormControl('')
              },
                { updateOn: 'blur' }
              );
    }

  ngOnInit() {

    // Get window size to determine how to present dialog windows
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > 1140) {
        this.dialogWidth = 1140 * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }

    this.form.disable();

    // If user got to this page without logging in (i.e. a bookmark or attack), send
    // them to the signin page and set the back path to the page they wanted to go
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
      console.log('PersonalComponent:ngOnInit: got new profile data=', data);
      this.profile = data;
      if (data) {
        if (!data.displayName) { this.profile.displayName = this.profile.firstName }
        this.form.patchValue ({
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          displayName: this.profile.displayName,
          yearOfBirth: this.profile.yearOfBirth,
          gender: this.profile.gender,
          homeCountry: this.profile.homeCountry,
          homeState: this.profile.homeState,
          myStory: this.profile.myStory
        });
        if (data.profileImageUrl) {
          this.profileImageUrl = data.profileImageUrl;
          this.profileImageLabel = 'personal.component.changeProfilePic'
        }
      }
      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
  }

  ngOnDestroy() {};


  // Help pop-up text
  formFieldHelp(controlDesc: string) {
    this.helpMsg = this.translate.instant(controlDesc);
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  // Give user more space to enter their story
  onMyStory() {
    this.openMyStoryDialog(this.profile.myStory);
  }

  // Compress Image and offer up for user to crop
  onProfileImageSelected(event: any) {
    this.showSpinner = true;
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.uploadImageSvc.uploadImage(compressedFile, (uploadedFileUrl: string) => {
        this.openImageCropperDialog(uploadedFileUrl);
      });
    });
  }

  // Present image for user to crop
  openImageCropperDialog(imageSource: string): void {
    let croppedImageBase64: string;
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: this.dialogWidthDisplay,
      height: '90%',
      disableClose: true,
      data: { image: imageSource }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) {
        if (result !== 'canceled') {
          croppedImageBase64 = result;
          this.uploadImageSvc.uploadImageBase64(croppedImageBase64, (uploadedFileUrl: string) => {
            this.profile.profileImageUrl = uploadedFileUrl;
            this.updatePersonal('profileImage');
            this.profileImageUrl = this.profile.profileImageUrl;
            this.profileImageLabel = 'personal.component.changeProfilePic'
            this.showSpinner = false;
            this.profileSvc.distributeProfileUpdate(this.profile);
          })
        } else {
          this.showSpinner = false;
        }
      } else {
        this.showSpinner = false;
      }
    });
  }


  // Let user update their story in a dialog with a lot more space to comfortably enter
  openMyStoryDialog(myStory: string): void {
    const dialogRef = this.dialog.open(MyStoryDialogComponent, {
      width: this.dialogWidthDisplay,
      height: '80%',
      disableClose: true,
      data: { myStory: myStory }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) {
        if (result !== 'canceled') {
          this.form.patchValue({'myStory': result});
          this.updateDataPoint('myStory');
        } else {
          this.showSpinner = false;
        }
      } else {
        if (this.profile.myStory) {
          this.form.patchValue({'myStory': result});
          this.updateDataPoint('myStory');
        }
        this.showSpinner = false;
      }
    });
  }


  /**** Field auto-update processing ****/
  updateDataPoint(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (this.form.controls[control].value === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = this.form.controls[control].value;
    }
    this.updatePersonal(control);
  }


  updateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = event;
    }
    this.updatePersonal(control);
  }


  updatePersonal(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this[SaveIcon] = false;
      console.log('PersonalComponent:updatePersonal: throw error ', error);
      throw new Error(error);
    });
  }


  // Validate year of birth entered is a number
  yearOfBirthValidator(control: AbstractControl): {[key: string]: boolean} | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      return { birthYear: true };
    }
    return null;
  }

  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
