import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { AuthenticationService } from './../../../core/services/data-services/authentication.service';
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
    userID: '',
    firstName: '',
    lastName: '',
    displayName: '',
    yearOfBirth: 0,
    homeCountry: '',
    homeState: ''
  };

  credentials: ItokenPayload;
  form: FormGroup;
  userID: string;
  showSpinner = false;
  httpError = false;
  httpErrorText = '';

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
              private authSvc: AuthenticationService,
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
    this.dataSvc.getUserProfile().subscribe(user => {
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
      if (error.status === 404) {
        console.log('got 404 so first time here');
        this.authSvc.getUsername().subscribe(credentials => {
          console.log('got credentials', credentials);
          this.credentials = credentials;
          this.userID = credentials._id;
          this.form.patchValue({
            firstName: this.credentials.firstName,
            displayName: this.credentials.firstName
          });
          this.showSpinner = false;
          this.form.enable();
        }, (err) => {
          console.log('got error?');
          this.showSpinner = false;
          console.error(err);
        });
      } else {
        this.showSpinner = false;
        console.error(error);
      }
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
    console.log('user before', this.user);
    this.user.userID = this.userID;
    this.user.firstName = this.form.controls.firstName.value;
    this.user.lastName = this.form.controls.lastName.value;
    this.user.displayName = this.form.controls.displayName.value;
    this.user.yearOfBirth = this.form.controls.yearOfBirth.value;
    this.user.homeCountry = this.form.controls.homeCountry.value;
    this.user.homeState = this.form.controls.homeState.value;
    this.httpError = false;
    this.httpErrorText = '';
    console.log('user after', this.user);
/*     const source = timer(5000);
    const subscribe = source.subscribe(val => { */
    this.dataSvc.updateProfilePersonal(this.user)
    .subscribe ((responseData) => {
      this.showSpinner = false;
      console.log('Updated ', responseData);
      this.shared.openSnackBar('Personal profile updated successfully', 'message');
    }, error => {
      this.showSpinner = false;
      console.log('in error!', error);
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
    // });
  }

  yearOfBirthValidator(control: AbstractControl): {[key: string]: boolean} | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      return { birthYear: true };
    }
    return null;
  }

  nameHelp() {
    this.shared.openSnackBar('Used for communication between RVLikeMe.com and you', 'message');
  }

  displayNameHelp() {
    this.shared.openSnackBar('Your "name" as shown to other users.  This could be your real name or a "handle".', 'message');
  }

  emailHelp() {
    this.shared.openSnackBar('Your user name for signing in and for communications from RVLikeMe.com', 'message');
  }

  yearOfBirthHelp() {
    this.shared.openSnackBar('Used to enable you to find people near your age group and will not be displayed to other users.', 'message');
  }

  homeCountryHelp() {
    this.shared.openSnackBar('Used to find other users that share your country of origin or domicile', 'message');
  }

  homeStateHelp() {
    this.shared.openSnackBar('Used to find other users that share your state of origin or domicile', 'message');
  }

  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
