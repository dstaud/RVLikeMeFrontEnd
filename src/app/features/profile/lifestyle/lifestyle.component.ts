import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';


/**** Interfaces for data for form selects ****/
export interface AboutMe {
  value: string;
  viewValue: string;
}

export interface RvLifestyle {
  value: string;
  viewValue: string;
}

export interface Worklife {
  value: string;
  viewValue: string;
}

export interface CampsWithMe {
  value: string;
  viewValue: string;
}

export interface Boondocking {
  value: string;
  viewValue: string;
}

export interface Traveling {
  value: string;
  viewValue: string;
}

/* This component allows users to enter information about their lifestyle.
I decided to implement auto-save in all large forms where changes are saved as user leaves the field.
It's possible this will be too noisy with internet traffic.  If that's the case, can move to save locally and submit at once,
but don't want to go to a Submit button model because that isn't very app-like and because I populate the form from the database
on-load, it's always dirty and marking pristine doesn't help.  This means route-guards won't work so user might leave form
and I can't notify them. */

@Component({
  selector: 'app-rvlm-lifestyle',
  templateUrl: './lifestyle.component.html',
  styleUrls: ['./lifestyle.component.scss']
})
export class LifestyleComponent implements OnInit {
  form: FormGroup;
  lifestyleImageUrls: Array<string> = [];

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showaboutMeSaveIcon = false;
  showrvUseSaveIcon = false;
  showworklifeSaveIcon = false;
  showcampsWithMeSaveIcon = false;
  showboondockingSaveIcon = false;
  showtravelingSaveIcon = false;

  // Store 'other' value locally
  rvUse = '';
  worklife = '';
  campsWithMe = '';
  boondocking = '';
  traveling = '';
  aboutMeFormValue = '';
  rvUseFormValue = '';
  worklifeFormValue = '';
  campsWithMeFormValue = '';
  boondockingFormValue = '';
  travelingFormValue = '';


  AboutMes: AboutMe[] = [
    {value: '', viewValue: ''},
    {value: 'dreamer', viewValue: 'profile.component.list.aboutme.dreamer'},
    {value: 'newbie', viewValue: 'profile.component.list.aboutme.newbie'},
    {value: 'experienced', viewValue: 'profile.component.list.aboutme.experienced'},
    {value: 'other', viewValue: 'profile.component.list.aboutme.other'}
  ];

  /**** Select form select field option data. ****/
  RvLifestyles: RvLifestyle[] = [
    {value: '', viewValue: ''},
    {value: 'FT', viewValue: 'profile.component.list.rvuse.ft'},
    {value: 'FS', viewValue: 'profile.component.list.rvuse.fs'},
    {value: 'FP', viewValue: 'profile.component.list.rvuse.fp'},
    {value: 'PS', viewValue: 'profile.component.list.rvuse.ps'},
    {value: 'NY', viewValue: 'profile.component.list.rvuse.ny'},
    {value: 'other', viewValue: 'profile.component.list.rvuse.other'}
  ];

  Worklives: Worklife[] = [
    {value: '', viewValue: ''},
    {value: 'retired', viewValue: 'profile.component.list.worklife.retired'},
    {value: 'military', viewValue: 'profile.component.list.worklife.military'},
    {value: 'work-travel', viewValue: 'profile.component.list.worklife.work-travel'},
    {value: 'work-full-time', viewValue: 'profile.component.list.worklife.work-full-time'},
    {value: 'work-part-time', viewValue: 'profile.component.list.worklife.work-part-time'},
    {value: 'onleave', viewValue: 'profile.component.list.worklife.onleave'},
    {value: 'other', viewValue: 'profile.component.list.worklife.other'}
  ];

  CampsWithMes: CampsWithMe[] = [
    {value: '', viewValue: ''},
    {value: 'single', viewValue: 'profile.component.list.campswithme.single'},
    {value: 'partner', viewValue: 'profile.component.list.campswithme.partner'},
    {value: 'children', viewValue: 'profile.component.list.campswithme.children'},
    {value: 'family', viewValue: 'profile.component.list.campswithme.family'},
    {value: 'friend', viewValue: 'profile.component.list.campswithme.friend'},
    {value: 'other', viewValue: 'profile.component.list.campswithme.other'}
  ];

  Boondockings: Boondocking[] = [
    {value: '', viewValue: ''},
    {value: 'most', viewValue: 'profile.component.list.boondocking.most'},
    {value: 'alot', viewValue: 'profile.component.list.boondocking.alot'},
    {value: 'some', viewValue: 'profile.component.list.boondocking.some'},
    {value: 'while', viewValue: 'profile.component.list.boondocking.while'},
    {value: 'haveto', viewValue: 'profile.component.list.boondocking.haveto'},
    {value: 'rarely', viewValue: 'profile.component.list.boondocking.rarely'},
    {value: 'want', viewValue: 'profile.component.list.boondocking.want'}
  ];

  Travelings: Traveling[] = [
    {value: '', viewValue: ''},
    {value: 'countries', viewValue: 'profile.component.list.traveling.countries'},
    {value: 'country', viewValue: 'profile.component.list.traveling.country'},
    {value: 'regional', viewValue: 'profile.component.list.traveling.regional'},
    {value: 'none', viewValue: 'profile.component.list.traveling.none'},
    {value: 'other', viewValue: 'profile.component.list.traveling.other'},
  ];

  private backPath: string;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  constructor(private profileSvc: ProfileService,
              private dialog: MatDialog,
              private location: Location,
              private router: Router,
              private authSvc: AuthenticationService,
              private uploadImageSvc: UploadImageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                aboutMe: new FormControl(''),
                rvUse: new FormControl(''),
                worklife: new FormControl(''),
                campsWithMe: new FormControl(''),
                boondocking: new FormControl(''),
                traveling: new FormControl('')
                })
}

  ngOnInit() {
    // If user got to this page without logging in (i.e. a bookmark or attack), send
    // them to the signin page and set the back path to the page they wanted to go
    this.showSpinner = true;
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.form.disable();

    this.listenForUserProfile();
   }

  ngOnDestroy() {};


  // If user selects change, then have the user select a new file and then delete the old one before uploading the new one
  changeImage(row: number, event: any) {
    let fileType: string = 'lifestyle';

    this.showSpinner = true;
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.deleteLifestyleImageUrlFromProfile(this.lifestyleImageUrls[row], uploadedFileUrl);
        this.showSpinner = false;
      });
    });
  }


  // When user opts to upload an image compress and upload to server and update the profile with new URL
  onLifestyleImageSelected(event: any) {
    let fileType: string = 'lifestyle';

    this.showSpinner = true;
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.updateProfileLifestyleImageUrls(uploadedFileUrl);
        this.showSpinner = false;
      });
    });
  }


  // Automatically pop-up the 'other' dialog with the correct
  // control and name when use clicks on select if other
  onActivateSelectItem(control: string, controlDesc: string) {
    if (this[control]) {
      this.openOtherDialog(control, controlDesc, 'other');
    }
  }


  // Form Select option processing
  onSelectedSelectItem(control: string, controlDesc: string, event: string) {

    // If user chose other, set description for dialog
    if (event === 'other') {
      this.openOtherDialog(control, controlDesc, event);
    } else {

      // If user did not choose other, call the correct update processor for the field selected
      this[control] = '';
      this.updateDataPoint(event, control);
    }
  }


  // View lifestyle image larger
  openImageViewDialog(row: number): void {
    let imageUrl = this.lifestyleImageUrls[row];

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '95%',
      maxWidth: 600,
      data: {imageUrl: imageUrl, alter: true }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result === 'delete') {
        this.deleteLifestyleImageUrlFromProfile(this.lifestyleImageUrls[row], '');
      } else if (result !== 'ok') {
        this.changeImage(row, result);
      }
    });
  }



  private deleteLifestyleImageUrlFromProfile(imageUrl: string, newImageFileUrl: string) {
    this.profileSvc.deleteLifestyleImageUrlFromProfile(this.profile._id, imageUrl)
    .subscribe(imageResult => {
      if (newImageFileUrl) {
        this.updateProfileLifestyleImageUrls(newImageFileUrl);
      } else {
        this.profileSvc.getProfile();
      }
    })
  }


  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;

      // If user selected other on a form field, need to get the data they entered
      // and set the form field to display 'other'
      if (this.otherData('aboutMe')) {
        this.aboutMeFormValue = 'other';
      } else {
        this.aboutMeFormValue = this.profile.aboutMe;
      }
      if (this.otherData('rvUse')) {
        this.rvUseFormValue = 'other';
      } else {
        this.rvUseFormValue = this.profile.rvUse;
      }
      if (this.otherData('worklife')) {
        this.worklifeFormValue = 'other';
      } else {
        this.worklifeFormValue = this.profile.worklife;
      }
      if (this.otherData('campsWithMe')) {
        this.campsWithMeFormValue = 'other';
      } else {
        this.campsWithMeFormValue = this.profile.campsWithMe;
      }
      if (this.otherData('boondocking')) {
        this.boondockingFormValue = 'other';
      } else {
        this.boondockingFormValue = this.profile.boondocking;
      }
      if (this.otherData('traveling')) {
        this.travelingFormValue = 'other';
      } else {
        this.travelingFormValue = this.profile.traveling;
      }

      this.form.patchValue ({
        aboutMe: this.aboutMeFormValue,
        rvUse: this.rvUseFormValue,
        worklife: this.worklifeFormValue,
        campsWithMe: this.campsWithMeFormValue,
        boondocking: this.boondockingFormValue,
        traveling: this.travelingFormValue
      });

      this.lifestyleImageUrls = this.profile.lifestyleImageUrls;

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error('LifestyleComponent:listeForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  // Select form 'Other' Dialog
  private openOtherDialog(control: string, name: string, event: string): void {
    let other = '';
    let selection = '';
    other = this[control];

    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: name, other: other }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) {
        if (result !== 'canceled') {
          if (this[control] !== result ) {
            this[control] = result;
            this.profile[control] = '@' + result;
            this.updateDataPoint(event, control);
          }
        }
      } else {
        if (this[control]) {
          this[control] = '';
          this.profile[control] = null;
          this.updateDataPoint(event, control);
          this.form.patchValue({[control]: null});
        } else {
          if (this.profile[control]) {
            selection = this.profile[control];
          }
          this.form.patchValue({[control]: selection});
        }
      }
    });
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  private otherData(control: string): boolean {
    let result = false;
    if (this.profile[control]) {
      if (this.profile[control].substring(0, 1) === '@') {
        this[control] = this.profile[control].substring(1, this.profile[control].length);
        result = true;
      }
    }
    return result;
  }


  /**** Field auto-update processing ****/
  private updateDataPoint(event: string, control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      if (this.form.controls[control].value !== 'other') {
        this.profile[control] = event;
      }
    }
    this.updateLifestyle(control);
  }

  private updateLifestyle(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this[SaveIcon] = false;
      console.log('LifestyleComponent:updateLifestyle: throw error ', error);
      throw new Error(error);
    });
  }


  // Update lifestyle image url array in user's profile with new uploaded lifestyle image.
  private updateProfileLifestyleImageUrls(lifestyleImageUrl: string) {
    console.log('LifestyleComponent:updateProfileLifestyleImageUrls: calling server ', lifestyleImageUrl, ' to profile for ', this.profile._id);
    this.profileSvc.addLifestyleImageUrlToProfile(this.profile._id, lifestyleImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.getProfile();
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('LifestyleComponent:updateProfileLifestyleImageUrls: throw error ', error);
      throw new Error(error);
    });
  }
}
