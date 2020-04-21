import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';

// TODO: Add rig database and hook to this component

export interface RigType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-rv-rig',
  templateUrl: './rv-rig.component.html',
  styleUrls: ['./rv-rig.component.scss']
})
export class RvRigComponent implements OnInit {
  form: FormGroup;
  rigType:string = '';
  rigImageUrls: Array<string> = [];

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showrigTypeSaveIcon = false;
  showrigManufacturerSaveIcon = false;
  showrigBrandSaveIcon = false;
  showrigModelSaveIcon = false;
  showrigYearSaveIcon = false;

  /**** Select form select field option data. ****/
  RigTypes: RigType[] = [
    {value: '', viewValue: ''},
    {value: 'A', viewValue: 'profile.component.list.rigtype.a'},
    {value: 'B', viewValue: 'profile.component.list.rigtype.b'},
    {value: 'C', viewValue: 'profile.component.list.rigtype.c'},
    {value: 'SC', viewValue: 'profile.component.list.rigtype.sc'},
    {value: 'FW', viewValue: 'profile.component.list.rigtype.fw'},
    {value: 'TT', viewValue: 'profile.component.list.rigtype.tt'},
    {value: 'TC', viewValue: 'profile.component.list.rigtype.tc'},
    {value: 'FT', viewValue: 'profile.component.list.rigtype.ft'},
    {value: 'V', viewValue: 'profile.component.list.rigtype.v'},
    {value: 'CB', viewValue: 'profile.component.list.rigtype.cb'},
    {value: 'other', viewValue: 'profile.component.list.rigtype.other'}
  ];

  // Interface for Profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private backPath: string;
  private rigTypeFormValue: string = '';
  private windowWidth: any;
  private dialogWidth: number;
  private dialogWidthDisplay: string;


  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDialogWindowDimensions();
  }

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private dialog: MatDialog,
              private router: Router,
              private location: Location,
              private uploadImageSvc: UploadImageService,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                rigType: new FormControl('', Validators.required),
                rigManufacturer: new FormControl(''),
                rigBrand: new FormControl(''),
                rigModel: new FormControl(''),
                rigYear: new FormControl('',
                                [Validators.minLength(4),
                                Validators.maxLength(4)])
              },
                { updateOn: 'blur' }
              );
}

  ngOnInit() {
    // If user got to this page without logging in (i.e. a bookmark or attack), send
    // them to the signin page and set the back path to the page they wanted to go
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.setDialogWindowDimensions();

    this.form.disable();

    this.showSpinner = true;

    this.listenForUserProfile();
  }

  ngOnDestroy() {}


  // As user to upload image, compress and orient the image and upload to server to store
  // If row is passed, this means being called to get a new image to replace an existing image
  getImage(row?: number) {
    let fileType: string = 'rig';
    this.uploadImageSvc.compressFile(fileType, (compressedFile: File) => {
      this.showSpinner = true;
      console.log('uploading compressed oriented file')
      this.uploadImageSvc.uploadImage(compressedFile, (uploadedFileUrl: string) => {
        console.log('RigComponent:onRigImageSelected: URL=', uploadedFileUrl);
        if (row) {
          this.deleteRigImageUrlFromProfile(this.rigImageUrls[row], uploadedFileUrl);
        } else {
          this.updateProfileRigImageUrls(uploadedFileUrl);
        }
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
      this.updateSelectItem(control, event);
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
    this.updateRig(control);
  }


  viewFullImage(row) {
    this.openImageViewDialog(row);
  }


  private deleteRigImageUrlFromProfile(imageUrl: string, newImageFileUrl: string) {
    this.profileSvc.deleteRigImageUrlFromProfile(this.profile._id, imageUrl)
    .subscribe(imageResult => {
      console.log('profile updated ', imageResult);
      if (newImageFileUrl) {
        this.updateProfileRigImageUrls(newImageFileUrl);
      } else {
        this.profileSvc.getProfile();
      }
    })
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  private handleOtherData(control: string): boolean {
    let result = false;
    if (this.profile[control]) {
      if (this.profile[control].substring(0, 1) === '@') {
        this[control] = this.profile[control].substring(1, this.profile[control].length);
        result = true;
      }
    }
    return result;
  }


  // Listen for user profile and when received, take action
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.profile = profileResult;

      // If user selected other on a form field, need to get the data they entered
      if (this.handleOtherData('rigType')) {
        this.rigTypeFormValue = 'other';
      } else {
        this.rigTypeFormValue = this.profile.rigType;
      }

      if (profileResult) {
        this.form.patchValue ({
          rigType: this.rigTypeFormValue,
          rigYear: this.profile.rigYear,
          rigManufacturer: this.profile.rigManufacturer,
          rigBrand: this.profile.rigBrand,
          rigModel: this.profile.rigModel
        });
      }

      this.rigImageUrls = this.profile.rigImageUrls;

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error('RigComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  // View rig image larger
  private openImageViewDialog(row: number): void {
    let imageUrl = this.rigImageUrls[row];

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '95%',
      maxWidth: 600,
      data: {imageUrl: imageUrl, alter: true }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result === 'change') {
        console.log('delete ', this.rigImageUrls[row], ' and add new one');
        this.getImage(row);
      } else if (result === 'delete') {
        console.log('delete ', this.rigImageUrls[row]);
        this.deleteRigImageUrlFromProfile(this.rigImageUrls[row], '');
      }
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
            this.updateRig(control);
          }
        }
      } else {
        if (this[control]) {
          this[control] = '';
          this.profile[control] = null;
          this.updateSelectItem(control, event);
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


  // Get window size to determine how to present dialog windows
  private setDialogWindowDimensions() {
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


  // Update rig image url array in user's profile with new uploaded rig image.
  private updateProfileRigImageUrls(rigImageUrl: string) {
    console.log('RvRigComponent:updateProfileRigImageUrls: calling server ', rigImageUrl, ' to profile for ', this.profile._id);
    this.profileSvc.addRigImageUrlToProfile(this.profile._id, rigImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.getProfile();
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('RvRigComponent:updateProfileRigImageUrls: throw error ', error);
      throw new Error(error);
    });
  }


  // Update form field data on server
  private updateRig(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
    }, error => {
      this[SaveIcon] = false;
      console.log('PersonalComponent:updateRig: throw error ', error);
      throw new Error(error);
    });
  }


  // Pre-process form data and call update on server
  private updateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = event;
    }
    this.updateRig(control);
  }
}
