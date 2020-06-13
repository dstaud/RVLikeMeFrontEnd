import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { trigger, transition, style, animate, state } from '@angular/animations';

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
import { DeviceService } from '@services/device.service';
import { ThemeService } from '@services/theme.service';

import { ImageViewDialogComponent } from '@dialogs/image-view-dialog/image-view-dialog.component';
import { SharedComponent } from '@shared/shared.component';

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
  styleUrls: ['./rv-rig.component.scss'],
  providers: [RigService],
  animations: [
    trigger('rigTypeOtherSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})
export class RvRigComponent implements OnInit {

  @Output()
  optionSelected: EventEmitter<MatAutocompleteSelectedEvent>

  // Could not use reactive forms for this form only because of the auto-complete of brand.  Couldn't get that to work with Reactive forms.
  rigBrand = new FormControl('');
  rigType = new FormControl('');
  rigTypeOther = new FormControl('');
  rigLength = new FormControl('', Validators.pattern('^[0-9]*$'));
  rigModel = new FormControl('');
  rigYear = new FormControl('', [Validators.minLength(4), Validators.maxLength(4)]);
  rigTow = new FormControl('');


  rigImageUrls: Array<string> = [];
  rigData: Array<IrigData> = [];
  rigBrands: Array<string> = [];
  filteredBrands: Observable<IrigData[]>;
  desktopUser: boolean = false;
  placeholderPhotoUrl: string = './../../../../assets/images/photo-placeholder.png';
  nbrRigImagePics: number = 0;
  brandSelected: string = null;
  newbie: boolean = false;
  theme: string;

  rigTypeOtherOpen: string = 'out';

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showrigTypeSaveIcon = false;
  showrigBrandSaveIcon = false;
  showrigModelSaveIcon = false;
  showrigTowSaveIcon = false;
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
  private returnRoute: string;

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
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
              private shared: SharedComponent,
              private themeSvc: ThemeService,
              private shareDataSvc: ShareDataService,
              private device: DeviceService,
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
      this.formEnable('disable');

      this.showSpinner = true;

      this.getRigData();

      this.listenForUserProfile();

      this.listenForColorTheme();
    }
  }

  ngOnDestroy() {}


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


  onBrandSelected(brand: string) {
    this.brandSelected = brand;
  }


  onOther(control: string) {
    let otherControl = control + 'Other';
    let value = '@' + this[otherControl].value;
    this.updateSelectItem(control, value);
  }


  // When user opts to upload an image compress and upload to server and update the profile with new URL
  onRigImageSelected(event: any) {
    let fileType: string = 'rig';

    if (event.target.files[0]) {
      this.showSpinner = true;
      this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
        this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
          if (uploadedFileUrl === 'error') {
            this.shared.openSnackBar('There was a problem uploading your photo.  It is likely too large.','error',5000);
            this.showSpinner = false;
          } else {
            this.updateProfileRigImageUrls(uploadedFileUrl);
            this.showSpinner = false;
          }
        });
      });
    }
  }


  // Form Select option processing
  onSelectedSelectItem(control: string, controlDesc: string, value: string) {
    let otherControl: string = control + 'OtherOpen';

    if (value === 'other') {
      this[otherControl] = 'in';
    } else {
      this[otherControl] = 'out';
      this.updateSelectItem(control, value);
    }

  }


  // Field auto-update processing
  onUpdateDataPoint(control: string) {
    let controlValue: string;

    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    controlValue = this[control].value;
    // controlValue = controlValue.trim();
    this[control].patchValue(controlValue);
    if (this[control].value === '') {
      this.profile[control] = null;
      this[control].patchValue(null);
    } else {
      this.profile[control] = this[control].value;
    }
    this.updateRig(control, this.profile[control]);
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
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"error deleting rig image","error":error}));
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
      this.rigTypeOther.disable();
      this.rigLength.disable();
      this.rigModel.disable();
      this.rigTow.disable();
      this.rigYear.disable();
    }

    if (action === 'enable') {
      this.rigBrand.enable();
      this.rigType.enable();
      this.rigTypeOther.enable();
      this.rigLength.enable();
      this.rigModel.enable();
      this.rigTow.enable();
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
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    })
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  private handleOtherData(control: string) {
    let otherControl = control + 'Other';
    let otherOpen = control + 'OtherOpen';
    let formValue = control + 'FormValue';

    if (this.profile[control]) {
      if (this.profile[control].startsWith('@')) {
        this[formValue] = 'other';
        this[otherControl].patchValue(this.profile[control].substring(1, this.profile[control].length));
        this[otherOpen] = 'in';
      } else {
        this[formValue] = this.profile[control];
      }
    }
  }


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"unable to listen for color theme","error":error}));
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

        // If user selected other on a form field, need to get the data they entered
        this.handleOtherData('rigType')

        this.rigType.patchValue(this.rigTypeFormValue);
        this.rigYear.patchValue(this.profile.rigYear);
        this.rigLength.patchValue(this.profile.rigLength);
        this.rigModel.patchValue(this.profile.rigModel);
        this.rigTow.patchValue(this.profile.rigTow);

        this.rigImageUrls = this.profile.rigImageUrls;


        // Put this hack in.  Getting strange behavior where it is coming back into this subscription without any place
        // nexting a new one and it has the placeholder in the profile...somehow.  This makes sure we ignore that.
        this.nbrRigImagePics = this.rigImageUrls.length;
        for (let i=0; i < this.rigImageUrls.length; i++) {
          if (this.rigImageUrls[i] === this.placeholderPhotoUrl) {
            this.nbrRigImagePics = i;
          }
        }

        for (let i=this.rigImageUrls.length; i < 3; i++) {
          this.rigImageUrls[i] = this.placeholderPhotoUrl;
        }

        if (this.profile.aboutMe === 'dreamer' || this.profile.aboutMe === 'newbie') {
          this.newbie = true;
        }

        // this.getRigData();
      }
    }, (error) => {
      this.showSpinner = false;
      this.sentry.logError('RigComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
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


  // Update rig image url array in user's profile with new uploaded rig image.
  private updateProfileRigImageUrls(rigImageUrl: string) {
    this.profileSvc.addRigImageUrlToProfile(this.profile._id, rigImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.profileSvc.distributeProfileUpdate(responseData);
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }


  // Update form field data on server
  private updateRig(control: string, value: any) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.profileSvc.updateProfileAttribute(this.profile._id, control, value)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      this.profileSvc.distributeProfileUpdate(responseData);
    }, error => {
      this[SaveIcon] = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }


  // Pre-process form data and call update on server
  private updateSelectItem(control: string, value: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (!value) {
      this.profile[control] = null;
      this[control].patchValue(null);
    } else {
      this.profile[control] = value;
    }
    this.updateRig(control, this.profile[control]);
  }
}
