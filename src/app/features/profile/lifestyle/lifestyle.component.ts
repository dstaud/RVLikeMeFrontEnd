import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { take, takeUntil } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { DataService } from '@services/data-services/data.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { Ilifestyle } from '@interfaces/lifestyle';
import { OtherDialogComponent } from '@dialogs/other-dialog/other-dialog.component';

import { SharedComponent } from '@shared/shared.component';

/**** Interfaces for data for form selects ****/
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


  // Interface for Lifestyle data
  lifestyle: Ilifestyle = {
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null
  };


  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showrvUseSaveIcon = false;
  showworklifeSaveIcon = false;
  showcampsWithMeSaveIcon = false;
  showboondockingSaveIcon = false;
  showtravelingSaveIcon = false;


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

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              private shared: SharedComponent,
              private dialog: MatDialog,
              private location: Location,
              private router: Router,
              private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
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

    this.dataSvc.getProfileLifestyle()
    .pipe(take(1)) // Auto-unsubscribe after first execution
    .subscribe(lifestyle => {
      this.lifestyle = lifestyle;

      // If user selected other on a form field, need to get the data they entered
      this.setOtherData('rvUse');
      this.setOtherData('worklife');
      this.setOtherData('campsWithMe');
      this.setOtherData('boondocking');
      this.setOtherData('traveling');

      // Update form with values from server
      this.form.patchValue({
        rvUse: this.lifestyle.rvUse,
        worklife: this.lifestyle.worklife,
        campsWithMe: this.lifestyle.campsWithMe,
        boondocking: this.lifestyle.boondocking,
        traveling: this.lifestyle.traveling
      });
      this.showSpinner = false;
      this.form.enable();
    }, (err) => {
      // TODO: What to do with error handling here
      this.showSpinner = false;
      console.error(err);
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
          if (this[control] !== result ) {
            this[control] = result;
            this.lifestyle[control] = '@' + result;
            this.updateDataPoint(event, control);
          }
        }
      } else {
        if (this[control]) {
          this[control] = '';
          this.lifestyle[control] = null;
          this.updateDataPoint(event, control);
          this.form.patchValue({[control]: null});
        } else {
          if (this.lifestyle[control]) {
            selection = this.lifestyle[control];
          }
          this.form.patchValue({[control]: selection});
        }
      }
    });
  }


  // @ indicates user selected 'other' and this is what they entered.  Stored with '@' in database.
  setOtherData(control: string) {
    if (this.lifestyle[control]) {
      if (this.lifestyle[control].substring(0, 1) === '@') {
        this[control] = this.lifestyle[control].substring(1, this.lifestyle[control].length);
        this.lifestyle[control] = 'other';
      }
    }
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
      this.lifestyle[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      if (this.form.controls[control].value !== 'other') {
        this.lifestyle[control] = event;
      }
    }
    this.updateLifestyle(control);
  }

  updateLifestyle(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.httpError = false;
    this.httpErrorText = '';
    this.dataSvc.updateProfileLifestyle(this.lifestyle)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
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
