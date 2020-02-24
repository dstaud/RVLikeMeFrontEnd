import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';

import { SharedComponent } from '@shared/shared.component';

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
  backPath: string;
  httpError = false;
  httpErrorText = '';
  helpMsg = '';

  // Interface for Profile data
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

  rigType = '';
  rigTypeFormValue = '';

  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showrigTypeSaveIcon = false;
  showrigManufacturerSaveIcon = false;
  showrigBrandSaveIcon = false;
  showrigModelSaveIcon = false;
  showrigYearSaveIcon = false;

  rvType = '';

  /**** Select form select field option data. ****/
  RigTypes: RigType[] = [
    {value: '', viewValue: ''},
    {value: 'A', viewValue: 'rig.component.list.rigtype.a'},
    {value: 'B', viewValue: 'rig.component.list.rigtype.b'},
    {value: 'C', viewValue: 'rig.component.list.rigtype.c'},
    {value: 'SC', viewValue: 'rig.component.list.rigtype.sc'},
    {value: 'FW', viewValue: 'rig.component.list.rigtype.fw'},
    {value: 'TT', viewValue: 'rig.component.list.rigtype.tt'},
    {value: 'TC', viewValue: 'rig.component.list.rigtype.tc'},
    {value: 'FT', viewValue: 'rig.component.list.rigtype.ft'},
    {value: 'V', viewValue: 'rig.component.list.rigtype.v'},
    {value: 'CB', viewValue: 'rig.component.list.rigtype.cb'},
    {value: 'other', viewValue: 'rig.component.list.rigtype.other'}
  ];


  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  constructor(private translate: TranslateService,
              private shared: SharedComponent,
              private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private dialog: MatDialog,
              private router: Router,
              private location: Location,
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
      console.log('in rig component=', data);
      this.profile = data;

      // If user selected other on a form field, need to get the data they entered
      if (this.otherData('rigType')) {
        this.rigTypeFormValue = 'other';
      } else {
        this.rigTypeFormValue = this.profile.rigType;
      }

      if (data) {
        this.form.patchValue ({
          rigType: this.rigTypeFormValue,
          rigYear: this.profile.rigYear
        });
      }

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
  }

  ngOnDestroy() {}

  // Automatically pop-up the 'other' dialog with the correct
  // control and name when use clicks on select if other
  activatedSelectItem(control: string, controlDesc: string) {
    if (this[control]) {
      this.openDialog(control, controlDesc, 'other');
    }
  }

  // Select form 'Other' Dialog
  openDialog(control: string, name: string, event: string): void {
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
      console.log('result and profile ', result, this.profile);
      if (result) {
        if (result !== 'canceled') {
          console.log('other=', this[control]);
          if (this[control] !== result ) {
            this[control] = result;
            console.log('before ', this.profile, this.profile.rvUse);
            this.profile[control] = '@' + result;
            console.log('after ', this.profile, this.profile.rvUse);
            console.log('calling update select ', this.profile, control, this.profile[control]);
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

  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  otherData(control: string): boolean {
    let result = false;
    if (this.profile[control]) {
      if (this.profile[control].substring(0, 1) === '@') {
        this[control] = this.profile[control].substring(1, this.profile[control].length);
        result = true;
      }
    }
    return result;
  }

  // Form Select option processing
  selectedSelectItem(control: string, controlDesc: string, event: string) {

    // If user chose other, set description for dialog
    if (event === 'other') {
      this.openDialog(control, controlDesc, event);
    } else {

      // If user did not choose other, call the correct update processor for the field selected
      this[control] = '';
      this.updateSelectItem(control, event);
    }
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
    this.updateRig(control);
  }

  updateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    console.log('in select item', this.profile);
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.profile[control] = event;
    }
    this.updateRig(control);
  }

  updateRig(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.httpError = false;
    this.httpErrorText = '';
    console.log('update profile=', this.profile);
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this[SaveIcon] = false;
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }



  // Validate year of birth entered is a number
  yearOfBirthValidator(control: AbstractControl): {[key: string]: boolean} | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      return { birthYear: true };
    }
    return null;
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
