import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { Iuser } from './../../../interfaces/user';
import { ItokenPayload } from './../../../interfaces/tokenPayload';
import { SharedComponent } from './../../../shared/shared.component';

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
  httpError = false;
  httpErrorText = '';
  helpMsg = '';

  countries: Country[] = [
    {value: '', viewValue: ''},
    {value: 'USA', viewValue: 'United States'},
    {value: 'CAN', viewValue: 'Canada'},
    {value: 'MEX', viewValue: 'Mexico'}
  ];

  states: State[] = [
    {value: '', viewValue: ''},
    {value: 'AL', viewValue: 'Alabama'},
    {value: 'AK', viewValue: 'Alaska'},
    {value: 'AZ', viewValue: 'Arizona'},
    {value: 'AR', viewValue: 'Arkansas'},
    {value: 'CA', viewValue: 'California'},
    {value: 'CO', viewValue: 'Colorado'},
    {value: 'CT', viewValue: 'Connecticut'},
    {value: 'DE', viewValue: 'Delaware'},
    {value: 'DC', viewValue: 'District Of Columbia'},
    {value: 'FL', viewValue: 'Florida'},
    {value: 'GA', viewValue: 'Georgia'},
    {value: 'HI', viewValue: 'Hawaii'},
    {value: 'ID', viewValue: 'Idaho'},
    {value: 'IL', viewValue: 'Illinois'},
    {value: 'IN', viewValue: 'Indiana'},
    {value: 'IA', viewValue: 'Iowa'},
    {value: 'KS', viewValue: 'Kansas'},
    {value: 'KY', viewValue: 'Kentucky'},
    {value: 'LA', viewValue: 'Louisiana'},
    {value: 'ME', viewValue: 'Maine'},
    {value: 'MD', viewValue: 'Maryland'},
    {value: 'MA', viewValue: 'Massachusetts'},
    {value: 'MI', viewValue: 'Michigan'},
    {value: 'MN', viewValue: 'Minnesota'},
    {value: 'MS', viewValue: 'Mississippi'},
    {value: 'MO', viewValue: 'Missouri'},
    {value: 'MT', viewValue: 'Montana'},
    {value: 'NE', viewValue: 'Nebraska'},
    {value: 'NV', viewValue: 'Nevada'},
    {value: 'NH', viewValue: 'New Hampshire'},
    {value: 'NJ', viewValue: 'New Jersey'},
    {value: 'NM', viewValue: 'New Mexico'},
    {value: 'NY', viewValue: 'New York'},
    {value: 'NC', viewValue: 'North Carolina'},
    {value: 'ND', viewValue: 'North Dakota'},
    {value: 'OH', viewValue: 'Ohio'},
    {value: 'OK', viewValue: 'Oklahoma'},
    {value: 'OR', viewValue: 'Oregon'},
    {value: 'PA', viewValue: 'Pennsylvania'},
    {value: 'SC', viewValue: 'South Carolina'},
    {value: 'SD', viewValue: 'South Dakota'},
    {value: 'TN', viewValue: 'Tennessee'},
    {value: 'TX', viewValue: 'Texas'},
    {value: 'UT', viewValue: 'Utah'},
    {value: 'VT', viewValue: 'Vermont'},
    {value: 'VA', viewValue: 'Virginia'},
    {value: 'WA', viewValue: 'Washington'},
    {value: 'WV', viewValue: 'West Virginia'},
    {value: 'WI', viewValue: 'Wisconsin'},
    {value: 'WY', viewValue: 'Wyoming'}
    ];

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

  changeHomeCountry(event) {
    this.form.controls.homeCountry.setValue(event.target.value, {
      onlySelf: true
    });
  }

  changeHomeState(event) {
    this.form.controls.homeState.setValue(event.target.value, {
      onlySelf: true
    });
  }

  onSubmit() {
    this.showSpinner = true;
    console.log('user before', this.user);
    this.httpError = false;
    this.httpErrorText = '';
    this.user.firstName = this.form.controls.firstName.value;
    this.user.lastName = this.form.controls.lastName.value;
    this.user.displayName = this.form.controls.displayName.value;
    this.user.yearOfBirth = this.form.controls.yearOfBirth.value;
    this.user.homeCountry = this.form.controls.homeCountry.value;
    this.user.homeState = this.form.controls.homeState.value;
    console.log('user after', this.user);
    this.dataSvc.updateProfilePersonal(this.user)
    .subscribe ((responseData) => {
      this.showSpinner = false;
      console.log('Updated ', responseData);
      this.shared.openSnackBar('Personal profile updated successfully', 'message');
      this.form.patchValue({
        firstName: responseData.firstName,
        lastName: responseData.lastName,
        displayName: responseData.displayName,
        yearOfBirth: responseData.yearOfBirth,
        homeCountry: responseData.homeCountry,
        homeState: responseData.homeState
      });
    }, error => {
      this.showSpinner = false;
      console.log('in error!', error);
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }

  yearOfBirthValidator(control: AbstractControl): {[key: string]: boolean} | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      return { birthYear: true };
    }
    return null;
  }

  nameHelp() {
    this.helpMsg = this.translate.instant('profile.component.helpName');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  displayNameHelp() {
    this.helpMsg = this.translate.instant('profile.component.helpDisplayName');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  emailHelp() {
    this.helpMsg = this.translate.instant('profile.component.helpEmail');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  yearOfBirthHelp() {
    this.helpMsg = this.translate.instant('profile.component.helpYearOfBirth');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  homeCountryHelp() {
    this.helpMsg = this.translate.instant('profile.component.helpHomeCountry');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  homeStateHelp() {
    this.helpMsg = this.translate.instant('profile.component.helpHomeState');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
