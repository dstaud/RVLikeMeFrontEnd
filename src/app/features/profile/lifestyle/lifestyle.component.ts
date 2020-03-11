import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';

import { SharedComponent } from '@shared/shared.component';

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
  httpError = false;
  httpErrorText = '';
  helpMsg = '';
  backPath: string;

  profile: IuserProfile;

  userProfile: Observable<IuserProfile>;

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
    {value: 'dreamer', viewValue: 'profile.component.list.aboutMe.dreamer'},
    {value: 'newbie', viewValue: 'profile.component.list.aboutMe.newbie'},
    {value: 'experienced', viewValue: 'profile.component.list.aboutMe.experienced'},
    {value: 'other', viewValue: 'profile.component.list.aboutMe.other'}
  ];

  /**** Select form select field option data. ****/
  RvLifestyles: RvLifestyle[] = [
    {value: '', viewValue: ''},
    {value: 'FT', viewValue: 'lifestyle.component.list.rvuse.ft'},
    {value: 'FS', viewValue: 'lifestyle.component.list.rvuse.fs'},
    {value: 'FP', viewValue: 'lifestyle.component.list.rvuse.fp'},
    {value: 'PS', viewValue: 'lifestyle.component.list.rvuse.ps'},
    {value: 'NY', viewValue: 'lifestyle.component.list.rvuse.ny'},
    {value: 'other', viewValue: 'lifestyle.component.list.rvuse.other'}
  ];

  Worklives: Worklife[] = [
    {value: '', viewValue: ''},
    {value: 'retired', viewValue: 'lifestyle.component.list.worklife.retired'},
    {value: 'military', viewValue: 'lifestyle.component.list.worklife.military'},
    {value: 'work-travel', viewValue: 'lifestyle.component.list.worklife.work-travel'},
    {value: 'work-full-time', viewValue: 'lifestyle.component.list.worklife.work-full-time'},
    {value: 'work-part-time', viewValue: 'lifestyle.component.list.worklife.work-part-time'},
    {value: 'onleave', viewValue: 'lifestyle.component.list.worklife.onleave'},
    {value: 'workamp', viewValue: 'lifestyle.component.list.worklife.workamp'},
    {value: 'other', viewValue: 'lifestyle.component.list.worklife.other'}
  ];

  CampsWithMes: CampsWithMe[] = [
    {value: '', viewValue: ''},
    {value: 'single', viewValue: 'lifestyle.component.list.campswithme.single'},
    {value: 'partner', viewValue: 'lifestyle.component.list.campswithme.partner'},
    {value: 'children', viewValue: 'lifestyle.component.list.campswithme.children'},
    {value: 'family', viewValue: 'lifestyle.component.list.campswithme.family'},
    {value: 'friend', viewValue: 'lifestyle.component.list.campswithme.friend'},
    {value: 'other', viewValue: 'lifestyle.component.list.campswithme.other'}
  ];

  Boondockings: Boondocking[] = [
    {value: '', viewValue: ''},
    {value: 'most', viewValue: 'lifestyle.component.list.boondocking.most'},
    {value: 'alot', viewValue: 'lifestyle.component.list.boondocking.alot'},
    {value: 'some', viewValue: 'lifestyle.component.list.boondocking.some'},
    {value: 'while', viewValue: 'lifestyle.component.list.boondocking.while'},
    {value: 'haveto', viewValue: 'lifestyle.component.list.boondocking.haveto'},
    {value: 'rarely', viewValue: 'lifestyle.component.list.boondocking.rarely'},
    {value: 'never', viewValue: 'lifestyle.component.list.boondocking.never'},
    {value: 'want', viewValue: 'lifestyle.component.list.boondocking.want'}
  ];

  Travelings: Traveling[] = [
    {value: '', viewValue: ''},
    {value: 'countries', viewValue: 'lifestyle.component.list.traveling.countries'},
    {value: 'country', viewValue: 'lifestyle.component.list.traveling.country'},
    {value: 'regional', viewValue: 'lifestyle.component.list.traveling.regional'},
    {value: 'none', viewValue: 'lifestyle.component.list.traveling.none'},
    {value: 'other', viewValue: 'lifestyle.component.list.traveling.other'},
  ];

  // Since form is 'dirtied' pre-loading with data from server, can't be sure if they have
  // changed anything.  Activating a notification upon reload, just in case.
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }

  constructor(private profileSvc: ProfileService,
              private translate: TranslateService,
              private shared: SharedComponent,
              private dialog: MatDialog,
              private location: Location,
              private router: Router,
              private authSvc: AuthenticationService,
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
      console.log('in lifestyle component=', data);
      this.profile = data;

      // If user selected other on a form field, need to get the data they entered
      // and set the form field to display 'other'
      console.log('set others');
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

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });
  }

  ngOnDestroy() {};

  // Automatically pop-up the 'other' dialog with the correct
  // control and name when use clicks on select if other
  activatedSelectItem(control: string, controlDesc: string) {
    if (this[control]) {
      this.openDialog(control, controlDesc, 'other');
    }
  }

  // Help pop-up text
  formFieldHelp(controlDesc: string) {
    this.helpMsg = this.translate.instant(controlDesc);
    this.shared.openSnackBar(this.helpMsg, 'message');
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
      if (result) {
        if (result !== 'canceled') {
          console.log('other and result ', this[control], result);
          if (this[control] !== result ) {
            this[control] = result;
            console.log('lifestyle before ', this.profile);
            this.profile[control] = '@' + result;
            console.log('lifestyle after', this.profile);
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
      this.updateDataPoint(event, control);
    }
  }


  /**** Field auto-update processing ****/
  updateDataPoint(event: string, control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.profile[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      if (this.form.controls[control].value !== 'other') {
        console.log('updatedatapoint ', event);
        this.profile[control] = event;
      }
    }
    this.updateLifestyle(control);
  }

  updateLifestyle(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.httpError = false;
    this.httpErrorText = '';
    console.log('updating lifestyle=', this.profile);
    this.profileSvc.updateProfile(this.profile)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
      console.log('update response = ', responseData);
      // this.profileSvc.distributeProfileUpdate(this.profile);
    }, error => {
      this[SaveIcon] = false;
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }


  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
