import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { RigService, IrigData } from '@services/data-services/rig.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';

// TODO: Add rig database and hook to this component

export interface RigType {
  value: string;
  viewValue: string;
}

export interface RigBrandManufacturer {
  brandID: string;
  manufacturer: string;
}

@Component({
  selector: 'app-rvlm-rv-rig',
  templateUrl: './rv-rig.component.html',
  styleUrls: ['./rv-rig.component.scss']
})
export class RvRigComponent implements OnInit {

  @Output()
  optionSelected: EventEmitter<MatAutocompleteSelectedEvent>


  rigBrand = new FormControl('');
  rigType = new FormControl('', Validators.required);
  rigLength = new FormControl('', Validators.pattern('^[0-9]*$'));
  rigModel = new FormControl('');
  rigYear = new FormControl('', [Validators.minLength(4), Validators.maxLength(4)]);
  brandSelected: string = null;

  rigImageUrls: Array<string> = [];
  rigData: Array<IrigData> = [];
  rigBrands: Array<string> = [];
  filteredBrands: Observable<IrigData[]>;

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showrigTypeSaveIcon = false;
  showrigBrandSaveIcon = false;
  showrigModelSaveIcon = false;
  showrigYearSaveIcon = false;
  showrigLengthSaveIcon = false;

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
              private rigSvc: RigService,
              private activateBackArrowSvc: ActivateBackArrowService) {}

  ngOnInit() {
    // If user got to this page without logging in (i.e. a bookmark or attack), send
    // them to the signin page and set the back path to the page they wanted to go
    if (!this.authSvc.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.setDialogWindowDimensions();

    this.showSpinner = true;

    this.listenForUserProfile();

    this.filteredBrands = this.rigBrand.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  ngOnDestroy() {}


  // Automatically pop-up the 'other' dialog with the correct
  // control and name when use clicks on select if other
  onActivateSelectItem(control: string, controlDesc: string) {
    if (this[control]) {
      this.openOtherDialog(control, controlDesc, 'other');
    }
  }


  onBrandSelected(brand: string) {
    console.log('RVRigComponent:onBrandSelected: optionSelected=', brand);
    this.brandSelected = brand;
  }


  // If user selects change, then have the user select a new file and then delete the old one before uploading the new one
  changeImage(row: number, event: any) {
    let fileType: string = 'rig';

    this.showSpinner = true;
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.deleteRigImageUrlFromProfile(this.rigImageUrls[row], uploadedFileUrl);
        this.showSpinner = false;
      });
    });
  }


  // When user opts to upload an image compress and upload to server and update the profile with new URL
  onRigImageSelected(event: any) {
    let fileType: string = 'rig';

    this.showSpinner = true;
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.updateProfileRigImageUrls(uploadedFileUrl);
        this.showSpinner = false;
      });
    });
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


  // Field auto-update processing
  onUpdateDataPoint(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (this[control].value === '') {
      this.profile[control] = null;
      this[control] = null;
    } else {
      this.profile[control] = this[control].value;
    }
    this.updateRig(control);
  }

  // View rig image larger
  openImageViewDialog(row: number): void {
    let imageUrl = this.rigImageUrls[row];

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '95%',
      maxWidth: 600,
      data: {imageUrl: imageUrl, alter: true }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result === 'delete') {
        this.deleteRigImageUrlFromProfile(this.rigImageUrls[row], '');
      } else if (result !== 'ok') {
        this.changeImage(row, result);
      }
    });
  }


  // Update brand / Manufacturer data
  updateBrand() {
    let brandInfo: RigBrandManufacturer;

    console.log('RVRigComponent:updateBrand: brandSelected=', this.brandSelected);
    this.showrigBrandSaveIcon = true;
    this.profile.rigBrand = this.rigBrand.value;

    if (this.brandSelected) {
      if (this.rigBrand.value === this.brandSelected) {
        brandInfo = this.getBrandInfo(this.brandSelected);
        this.profile.rigBrandID = brandInfo.brandID;
        this.profile.rigManufacturer = brandInfo.manufacturer;
        console.log('RVRigComponent:updateBrand: input=selected. ID=', this.profile.rigBrandID);
      } else {
        console.log('RVRigComponent:updateBrand: input<>selected', this.brandSelected);
        this.profile.rigBrandID = null;
        this.profile.rigManufacturer = null;
      }
    } else {
      this.profile.rigBrandID = null;
      this.profile.rigManufacturer = null;
    }
    console.log('RVRigComponent:updateBrand: update profile=', this.profile.rigBrand, ',', this.profile.rigBrandID, ',', this.profile.rigManufacturer);
    this.updateRig('rigBrand');
  }


  // Auto-complete for Brand/Manufacturer field
  private _filter(value: string): IrigData[] {
    const filterValue = value.toLowerCase();

    return this.rigData.filter(brand => brand.brand.toLowerCase().includes(filterValue)); // Match anywhere in the brand string.
    // return this.rigData.filter(brand => brand.brand.toLowerCase().indexOf(filterValue) === 0); // Just match beginning of brands. This is faster but not as nice
  }


  // Delete the image url from the user's profile
  private deleteRigImageUrlFromProfile(imageUrl: string, newImageFileUrl: string) {
    this.profileSvc.deleteRigImageUrlFromProfile(this.profile._id, imageUrl)
    .subscribe(imageResult => {
      if (newImageFileUrl) {
        this.updateProfileRigImageUrls(newImageFileUrl);
      } else {
        this.profileSvc.getProfile();
      }
    })
  }


  private getBrandInfo(brand: string): RigBrandManufacturer {
    let brandID: string = null;
    let manufacturer: string = null;
    let result: any;

    for (let i=0; i < this.rigData.length; i++) {
      if (this.rigData[i].brand === brand) {
        brandID = this.rigData[i]._id;
        manufacturer = this.rigData[i].manufacturer;
        break;
      }
    }

    result = JSON.parse('{"brandID":"' + brandID + '","manufacturer":"' + manufacturer + '"}');

    return result;
  }

  private getRigData() {
    this.rigSvc.getRigData()
    .pipe(untilComponentDestroyed(this))
    .subscribe(rigData => {
      this.rigData = rigData;
      this.rigBrand.patchValue(this.profile.rigBrand);
      this.brandSelected = null;
      this.showSpinner = false;
    }, error => {
      console.log('RVRigComponent:getRigData: error=', error);
      this.showSpinner = false;
      throw new Error(error);
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
      if (profileResult.firstName) {
        this.profile = profileResult;

        // If user selected other on a form field, need to get the data they entered
        if (this.handleOtherData('rigType')) {
          this.rigTypeFormValue = 'other';
        } else {
          this.rigTypeFormValue = this.profile.rigType;
        }

        this.rigType.patchValue (this.rigTypeFormValue);
        this.rigYear.patchValue(this.profile.rigYear);
        this.rigLength.patchValue(this.profile.rigLength);
        this.rigModel.patchValue(this.profile.rigModel);
        this.rigImageUrls = this.profile.rigImageUrls;

        this.getRigData();
      }
    }, (error) => {
      this.showSpinner = false;
      console.error('RigComponent:listenForUserProfile: error getting profile ', error);
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
            this.updateRig(control);
          }
        }
      } else {
        if (this[control]) {
          this[control] = '';
          this.profile[control] = null;
          this.updateSelectItem(control, event);
          this[control].patchValue(null);
        } else {
          if (this.profile[control]) {
            selection = this.profile[control];
          }
          this[control].patchValue(selection);
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
      console.error('RigComponent:updateRig: throw error ', error);
      throw new Error(error);
    });
  }


  // Pre-process form data and call update on server
  private updateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this[control].patchValue(null);
    } else {
      this.profile[control] = event;
    }
    this.updateRig(control);
  }
}
