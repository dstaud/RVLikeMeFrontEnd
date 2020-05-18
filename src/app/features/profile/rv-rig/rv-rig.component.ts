
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
import { DesktopMaxWidthService } from '@services/desktop-max-width.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { ShareDataService, IviewImage } from '@services/share-data.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';
import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';

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

  // Could not use reactive forms for this form only because of the auto-complete of brand.  Couldn't get that to work with Reactive forms.
  rigBrand = new FormControl('');
  rigType = new FormControl('');
  rigLength = new FormControl('', Validators.pattern('^[0-9]*$'));
  rigModel = new FormControl('');
  rigYear = new FormControl('', [Validators.minLength(4), Validators.maxLength(4)]);
  brandSelected: string = null;

  rigImageUrls: Array<string> = [];
  rigData: Array<IrigData> = [];
  rigBrands: Array<string> = [];
  filteredBrands: Observable<IrigData[]>;
  desktopUser: boolean = false;

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
  private rigTypeFormValue: string = '';
  private windowWidth: any;
  private dialogWidth: number;
  private desktopMaxWidth: number;
  private dialogWidthDisplay: string;
  private returnRoute: string;
  placeholderPhotoUrl: string = './../../../../assets/images/photo-placeholder.png';
  nbrRigImagePics: number = 0;

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
              private desktopMaxWidthSvc: DesktopMaxWidthService,
              private uploadImageSvc: UploadImageService,
              private sentry: SentryMonitorService,
              private rigSvc: RigService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService) {}

  ngOnInit() {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (window.innerWidth > 600) {
      this.desktopUser = true;
      this.setReturnRoute();
    }

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.listenForDesktopMaxWidth();

      this.formEnable('disable');

      this.showSpinner = true;

      this.listenForUserProfile();
    }



  }

  ngOnDestroy() {}


  onBack() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl(route);
  }


  onBrandSelected(brand: string) {
    this.brandSelected = brand;
  }


  // When user opts to upload an image compress and upload to server and update the profile with new URL
  onRigImageSelected(event: any) {
    let fileType: string = 'rig';

    if (event.target.files[0]) {
      this.showSpinner = true;
      this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
        this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
          this.updateProfileRigImageUrls(uploadedFileUrl);
          this.showSpinner = false;
        });
      });
    }
  }


  // Form Select option processing
  onSelectedSelectItem(control: string, controlDesc: string, event: string) {

    // If user chose other, set description for dialog
    if (event === 'other') {
      this.openOtherDialog(control, controlDesc, event);
    } else {

      // If user did not choose other, call the correct update processor for the field selected
      // this[control] = '';
      this.updateSelectItem(control, event);
    }
  }


  // Field auto-update processing
  onUpdateDataPoint(control: string) {
    let controlValue: string;

    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    console.log('rigComponent:OnUpdateDatapoint: control=', control, ' value=', this[control].value);
    controlValue = this[control].value;
    controlValue = controlValue.trim();
    this[control].patchValue(controlValue);
    if (this[control].value === '') {
      this.profile[control] = null;
      this[control].patchValue(null);
    } else {
      this.profile[control] = this[control].value;
    }
    this.updateRig(control, this.profile[control]);
    console.log('rigComponent:onUpdateDataPoint: finished here');
  }


  onViewImage(row: number) {
    if (row < this.nbrRigImagePics) { // Don't do anything if placeholder image
      let imageData: IviewImage = {
        profileID: this.profile._id,
        imageType: 'rig',
        imageOwner: true,
        imageSource: this.rigImageUrls[row]
      }
      this.shareDataSvc.setData('viewImage', imageData);

      if (this.desktopUser) {
        this.openImageViewDialog(row);
      } else {
        this.activateBackArrowSvc.setBackRoute('profile/rig', 'forward');
        this.router.navigateByUrl('/profile/image-viewer');
      }
    }
  }


  // View rig image larger
  openImageViewDialog(row: number): void {
    let imageUrl = this.rigImageUrls[row];

    const dialogRef = this.dialog.open(ImageViewDialogComponent, {
      width: '600px',
      // height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      console.log('RigComponent:openImageViewDialog: result=', result);
    }, error => {
      this.sentry.logError({"message":"error deleting rig image","error":error});
    });
  }


  // Update brand / Manufacturer data
  updateBrand() {
    let brandInfo: RigBrandManufacturer;

    this.showrigBrandSaveIcon = true;
    this.profile.rigBrand = this.rigBrand.value;

    if (this.brandSelected) {
      if (this.rigBrand.value === this.brandSelected) {
        brandInfo = this.getBrandInfo(this.brandSelected);
        this.profile.rigBrandID = brandInfo.brandID;
        this.profile.rigManufacturer = brandInfo.manufacturer;
      } else {
        this.profile.rigBrandID = null;
        this.profile.rigManufacturer = null;
      }
    } else {
      this.profile.rigBrandID = null;
      this.profile.rigManufacturer = null;
    }
    this.updateRig('rigBrand', this.profile.rigBrand);
    this.updateRig('rigBrandID', this.profile.rigBrandID);
    this.updateRig('rigManufacturer', this.profile.rigManufacturer);
  }


  // Auto-complete for Brand/Manufacturer field
  private _filter(value: string): IrigData[] {
    const filterValue = value.toLowerCase();

    return this.rigData.filter(brand => brand.brand.toLowerCase().includes(filterValue)); // Match anywhere in the brand string.
    // return this.rigData.filter(brand => brand.brand.toLowerCase().indexOf(filterValue) === 0); // Just match beginning of brands. This is faster but not as nice
  }


  private formEnable(action: string) {
    if (action === 'disable') {
      this.rigBrand.disable();
      this.rigType.disable();
      this.rigLength.disable();
      this.rigModel.disable();
      this.rigYear.disable();
    }

    if (action === 'enable') {
      this.rigBrand.enable();
      this.rigType.enable();
      this.rigLength.enable();
      this.rigModel.enable();
      this.rigYear.enable();
    }
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
      console.log('RigComponent: getRigData: rigData=', rigData);
      this.rigData = rigData;
      this.rigBrand.patchValue(this.profile.rigBrand);
      this.brandSelected = null;

      this.filteredBrands = this.rigBrand.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

      this.formEnable('enable');

      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('RvRigComponent:getRigData: error getting rig data=', error);
      throw new Error(error);
    })
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  private handleOtherData(control: string): boolean {
    let result = false;
    if (this.profile[control]) {
      if (this.profile[control].substring(0, 1) === '@') {
        result = true;
      }
    }
    return result;
  }


  private listenForDesktopMaxWidth() {
    this.desktopMaxWidthSvc.desktopMaxWidth
    .pipe(untilComponentDestroyed(this))
    .subscribe(maxWidth => {
      this.desktopMaxWidth = maxWidth;
      this.setDialogWindowDimensions();
    }, error => {
      this.sentry.logError({"message":"error listening for desktop max width","error":error});
      this.desktopMaxWidth = 1140;
      this.setDialogWindowDimensions();
    });
  }


  // Listen for user profile and when received, take action
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      if (profileResult.firstName) {
        this.profile = profileResult;
        console.log('RigComponent:listenForProfileuser: profile=', this.profile);
        // If user selected other on a form field, need to get the data they entered
        if (this.handleOtherData('rigType')) {
          this.rigTypeFormValue = 'other';
        } else {
          this.rigTypeFormValue = this.profile.rigType;
        }

        this.rigType.patchValue(this.rigTypeFormValue);
        this.rigYear.patchValue(this.profile.rigYear);
        this.rigLength.patchValue(this.profile.rigLength);
        this.rigModel.patchValue(this.profile.rigModel);

        this.rigImageUrls = this.profile.rigImageUrls;

        this.nbrRigImagePics = this.rigImageUrls.length;

        for (let i=this.rigImageUrls.length; i < 3; i++) {
          this.rigImageUrls[i] = this.placeholderPhotoUrl;
        }
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
    let SaveIcon = 'show' + control + 'SaveIcon';
    let other = '';
    let selection = '';
    if (this.profile[control].substring(0,1) === '@') { // previous value was an entered other value
      other = this.profile[control].substring(1, this.profile[control].length);
    } else {
      other = '';
    }

    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: name, other: other }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result) { // A value was returned
        if (result !== 'canceled') { // The user did not click the cancel button
          if (other !== result ) { // The value was changed from original value
            // this[control] = result;
            this.profile[control] = '@' + result;
            this[SaveIcon] = true;
            this.updateRig(control, this.profile[control]);
          }
        }
      } else { // No value was returned
        if (this[control]) { // Control had a value before
          // this[control] = '';
          this.profile[control] = null;
          this.updateSelectItem(control, result);
          this[control].patchValue(null);
        } else { // Control did not have a value before
          if (this.profile[control]) {
            selection = this.profile[control];
          }
          this[control].patchValue(selection);
        }
      }
    }, error => {
      this.sentry.logError({"message":"error closing dialog","error":error});
    });
  }


  // Get window size to determine how to present dialog windows
  private setDialogWindowDimensions() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > this.desktopMaxWidth) {
        this.dialogWidth = this.desktopMaxWidth * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }
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
      console.log('YourStoryComponent:ngOnInit: Return Route=', this.returnRoute);
    }, error => {
      console.error('YourStoryComponent:setReturnRoute: error setting return route ', error);
    });
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
  private updateRig(control: string, value: any) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    console.log('RigComponent:updateRig: profileID=', this.profile._id, ' control=', control, ' value=', value);
    this.profileSvc.updateProfileAttribute(this.profile._id, control, value)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      console.log('RigComponent:updateRig: back from update, before save icon, data=', responseData);
      this[SaveIcon] = false;
    }, error => {
      this[SaveIcon] = false;
      console.error('RigComponent:updateRig: throw error ', error);
      throw new Error(error);
    });
    console.log('RigComponent:updateRig: back from update, before back from subscribe');
  }


  // Pre-process form data and call update on server
  private updateSelectItem(control: string, event: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (!event) {
      this.profile[control] = null;
      this[control].patchValue(null);
    } else {
      this.profile[control] = event;
    }
    this.updateRig(control, this.profile[control]);
  }
}
