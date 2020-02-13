import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { Iuser } from './../../../interfaces/user';
import { ItokenPayload } from './../../../interfaces/tokenPayload';
import { SharedComponent } from './../../../shared/shared.component';
// import { IDeactivate } from './../../../core/guards/can-deactivate';

export interface Country {
  value: string;
  viewValue: string;
}

export interface State {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})

  // export class PersonalComponent implements OnInit, IDeactivate {
  // Using IDeactivate works to stop user from leaving form BUT, ALWAYS stops them whether typed anything or not.
  // markAsPristine() and markAsUntouched() didn't seem to have an impact.
  // So, had to take that guard off.
  // export class PersonalComponent implements OnInit, IDeactivate {
  export class PersonalComponent implements OnInit {
  user: Iuser = {
    firstName: '',
    lastName: '',
    displayName: '',
    yearOfBirth: 0,
    homeCountry: '',
    homeState: '',
    language: ''
  };

  credentials: ItokenPayload;
  form: FormGroup;
  showSpinner = false;
  showFirstNameSpinner = false;
  showLastNameSpinner = false;
  showDisplayNameSpinner = false;
  showYearOfBirthSpinner = false;
  showHomeCountrySpinner = false;
  showHomeStateSpinner = false;
  httpError = false;
  httpErrorText = '';
  helpMsg = '';

  countries: Country[] = [
    {value: '', viewValue: ''},
    {value: 'USA', viewValue: 'personal.component.list.country.usa'},
    {value: 'CAN', viewValue: 'personal.component.list.country.can'},
    {value: 'MEX', viewValue: 'personal.component.list.country.mex'}
  ];

  states: State[] = [
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

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (this.hasUnsavedData()) {
            $event.returnValue = true;
        }
    }

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              private shared: SharedComponent,
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
    this.showSpinner = true;
    this.dataSvc.getProfilePersonal()
    .subscribe(user => {
      console.log('back from server');
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

  yearOfBirthValidator(control: AbstractControl): {[key: string]: boolean} | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      return { birthYear: true };
    }
    return null;
  }

  nameHelp() {
    this.helpMsg = this.translate.instant('personal.component.helpName');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  displayNameHelp() {
    this.helpMsg = this.translate.instant('personal.component.helpDisplayName');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  emailHelp() {
    this.helpMsg = this.translate.instant('personal.component.helpEmail');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  yearOfBirthHelp() {
    this.helpMsg = this.translate.instant('personal.component.helpYearOfBirth');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  homeCountryHelp() {
    this.helpMsg = this.translate.instant('personal.component.helpHomeCountry');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  homeStateHelp() {
    this.helpMsg = this.translate.instant('personal.component.helpHomeState');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

  updateFirstName() {
    this.showFirstNameSpinner = true;
    this.user.firstName = this.form.controls.firstName.value;
    this.updateProfile('firstName');
  }

  updateLastName() {
    this.showLastNameSpinner = true;
    this.user.lastName = this.form.controls.lastName.value;
    this.updateProfile('lastName');
  }

  updateDisplayName() {
    this.showDisplayNameSpinner = true;
    this.user.displayName = this.form.controls.displayName.value;
    this.updateProfile('displayName');
  }

  updateYearOfBirth() {
    this.showYearOfBirthSpinner = true;
    this.user.yearOfBirth = this.form.controls.yearOfBirth.value;
    this.updateProfile('yearOfBirth');
  }

  updateHomeCountry(country: string) {
    this.showHomeCountrySpinner = true;
    this.user.homeCountry = country;
    this.updateProfile('homeCountry');
  }

  updateHomeState(state: string) {
    this.showHomeStateSpinner = true;
    this.user.homeState = state;
    this.updateProfile('homeState');
  }

  updateProfile(field: string) {
    this.httpError = false;
    this.httpErrorText = '';
    this.dataSvc.updateProfilePersonal(this.user)
    .subscribe ((responseData) => {
      if (field === 'firstName') {
        this.showFirstNameSpinner = false;
      }
      if (field === 'lastName') {
        this.showLastNameSpinner = false;
      }
      if (field === 'displayName') {
        this.showDisplayNameSpinner = false;
      }
      if (field === 'yearOfBirth') {
        this.showYearOfBirthSpinner = false;
      }
      if (field === 'homeCountry') {
        this.showHomeCountrySpinner = false;
      }
      if (field === 'homeState') {
        this.showHomeStateSpinner = false;
      }
    }, error => {
      if (field === 'firstName') {
        this.showFirstNameSpinner = false;
      }
      if (field === 'lastName') {
        this.showLastNameSpinner = false;
      }
      if (field === 'displayName') {
        this.showDisplayNameSpinner = false;
      }
      if (field === 'yearOfBirth') {
        this.showYearOfBirthSpinner = false;
      }
      if (field === 'homeCountry') {
        this.showHomeCountrySpinner = false;
      }
      if (field === 'homeState') {
        this.showHomeStateSpinner = false;
      }
      console.log('in error!', error);
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }

  private hasUnsavedData() {
    return true;
  }
}
