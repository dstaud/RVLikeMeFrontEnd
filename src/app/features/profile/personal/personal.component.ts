import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { take, takeUntil } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { ActivateBackArrowService } from './../../../core/services/activate-back-arrow.service';
import { AuthenticationService } from './../../../core/services/data-services/authentication.service';
import { Iuser } from './../../../interfaces/user';
import { ItokenPayload } from './../../../interfaces/tokenPayload';
import { SharedComponent } from './../../../shared/shared.component';

/**** Interfaces for data for form selects ****/
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
  httpError = false;
  httpErrorText = '';
  helpMsg = '';
  
  // Interface for Personal data
  user: Iuser = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: null
  };


  // Spinner is for initial load from the database only.
  // SaveIcons are shown next to each field as users leave the field, while doing the update
  showSpinner = false;
  showfirstNameSaveIcon = false;
  showlastNameSaveIcon = false;
  showdisplayNameSaveIcon = false;
  showyearOfBirthSaveIcon = false;
  showhomeCountrySaveIcon = false;
  showhomeStateSaveIcon = false;


  /**** Select form select field option data. ****/
  Countries: Country[] = [
    {value: '', viewValue: ''},
    {value: 'USA', viewValue: 'personal.component.list.country.usa'},
    {value: 'CAN', viewValue: 'personal.component.list.country.can'}
  ];

  States: State[] = [
    {value: '', viewValue: ''},
    {value: 'AL', viewValue: 'personal.component.list.state.al'},
    {value: 'AK', viewValue: 'personal.component.list.state.ak'},
    {value: 'AZ', viewValue: 'personal.component.list.state.az'},
    {value: 'AR', viewValue: 'personal.component.list.state.ar'},
    {value: 'CA', viewValue: 'personal.component.list.state.ca'},
    {value: 'CO', viewValue: 'personal.component.list.state.co'},
    {value: 'CT', viewValue: 'personal.component.list.state.ct'},
    {value: 'DE', viewValue: 'personal.component.list.state.de'},
    {value: 'DC', viewValue: 'personal.component.list.state.dc'},
    {value: 'FL', viewValue: 'personal.component.list.state.fl'},
    {value: 'GA', viewValue: 'personal.component.list.state.ga'},
    {value: 'HI', viewValue: 'personal.component.list.state.hi'},
    {value: 'ID', viewValue: 'personal.component.list.state.id'},
    {value: 'IL', viewValue: 'personal.component.list.state.il'},
    {value: 'IN', viewValue: 'personal.component.list.state.in'},
    {value: 'IA', viewValue: 'personal.component.list.state.ia'},
    {value: 'KS', viewValue: 'personal.component.list.state.ks'},
    {value: 'KY', viewValue: 'personal.component.list.state.ky'},
    {value: 'LA', viewValue: 'personal.component.list.state.la'},
    {value: 'ME', viewValue: 'personal.component.list.state.me'},
    {value: 'MD', viewValue: 'personal.component.list.state.md'},
    {value: 'MA', viewValue: 'personal.component.list.state.ma'},
    {value: 'MI', viewValue: 'personal.component.list.state.mi'},
    {value: 'MN', viewValue: 'personal.component.list.state.mn'},
    {value: 'MS', viewValue: 'personal.component.list.state.ms'},
    {value: 'MO', viewValue: 'personal.component.list.state.mo'},
    {value: 'MT', viewValue: 'personal.component.list.state.mt'},
    {value: 'NE', viewValue: 'personal.component.list.state.ne'},
    {value: 'NV', viewValue: 'personal.component.list.state.nv'},
    {value: 'NH', viewValue: 'personal.component.list.state.nh'},
    {value: 'NJ', viewValue: 'personal.component.list.state.nj'},
    {value: 'NM', viewValue: 'personal.component.list.state.nm'},
    {value: 'NY', viewValue: 'personal.component.list.state.ny'},
    {value: 'NC', viewValue: 'personal.component.list.state.nc'},
    {value: 'ND', viewValue: 'personal.component.list.state.nd'},
    {value: 'OH', viewValue: 'personal.component.list.state.oh'},
    {value: 'OK', viewValue: 'personal.component.list.state.ok'},
    {value: 'OR', viewValue: 'personal.component.list.state.or'},
    {value: 'PA', viewValue: 'personal.component.list.state.pa'},
    {value: 'SC', viewValue: 'personal.component.list.state.sc'},
    {value: 'SD', viewValue: 'personal.component.list.state.sd'},
    {value: 'TN', viewValue: 'personal.component.list.state.tn'},
    {value: 'TX', viewValue: 'personal.component.list.state.tx'},
    {value: 'UT', viewValue: 'personal.component.list.state.ut'},
    {value: 'VT', viewValue: 'personal.component.list.state.vt'},
    {value: 'VA', viewValue: 'personal.component.list.state.va'},
    {value: 'WA', viewValue: 'personal.component.list.state.wa'},
    {value: 'WV', viewValue: 'personal.component.list.state.wv'},
    {value: 'WI', viewValue: 'personal.component.list.state.wi'},
    {value: 'WY', viewValue: 'personal.component.list.state.wy'}
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
              private authSvc: AuthenticationService,
              private router: Router,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                lastName: new FormControl(''),
                displayName: new FormControl('', Validators.required),
                yearOfBirth: new FormControl('',
                                              [Validators.minLength(4),
                                               Validators.maxLength(4),
                                               this.yearOfBirthValidator]),
                homeCountry: new FormControl(''),
                homeState: new FormControl('')
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

    this.dataSvc.getProfilePersonal()
    .pipe(take(1)) // Auto-unsubscribe after first execution
    .subscribe(user => {
      this.user = user;
      if (!this.user.displayName) { this.user.displayName = this.user.firstName; }
      this.form.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        displayName: this.user.displayName,
        yearOfBirth: this.user.yearOfBirth,
        homeCountry: this.user.homeCountry,
        homeState: this.user.homeState
      });
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


  /**** Field auto-update processing ****/
  updateDataPoint(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (this.form.controls[control].value === '') {
      this.user[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.user[control] = this.form.controls[control].value;
    }
    this.updatePersonal(control);
  }


  updateSelectItem(control: string, event) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this[SaveIcon] = true;
    if (event === '') {
      this.user[control] = null;
      this.form.patchValue({ [control]: null });
    } else {
      this.user[control] = event;
    }
    this.updatePersonal(control);
  }

  
  updatePersonal(control: string) {
    let SaveIcon = 'show' + control + 'SaveIcon';
    this.httpError = false;
    this.httpErrorText = '';
    this.dataSvc.updateProfilePersonal(this.user)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this[SaveIcon] = false;
    }, error => {
      this[SaveIcon] = false;
      console.log('in error!', error);
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

  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
