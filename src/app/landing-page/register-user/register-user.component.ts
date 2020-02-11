import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { DataService } from './../../core/services/data-services/data.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { Iuser } from './../../interfaces/user';
import { SharedComponent } from './../../shared/shared.component';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  showSpinner = false;
  credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    tokenExpire: 0
  };
  profile: Iuser = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    homeCountry: null,
    homeState: null,
    language: null
  };
  httpError = false;
  httpErrorText = '';

  constructor(private signinBtnVisibleSvc: SigninButtonVisibleService,
              private authSvc: AuthenticationService,
              private dataSvc: DataService,
              private shared: SharedComponent,
              private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required),
                passwordConfirm: new FormControl('', Validators.required)
              });
}

  ngOnInit() {
  }

  onSubmit() {
    if (this.form.controls.password.value !== this.form.controls.passwordConfirm.value) {
      this.shared.openSnackBar('Passwords do not match', 'error');
      this.form.controls.password.reset();
      this.form.controls.passwordConfirm.reset();
      this.form.controls.password.markAllAsTouched();
      this.form.controls.password.setErrors({incorrect: true});
    } else {
      this.credentials.email = this.form.controls.email.value;
      this.credentials.email = this.credentials.email.toLowerCase();
      this.credentials.password = this.form.controls.password.value;
      this.showSpinner = true;
      this.authSvc.registerUser(this.credentials)
      .subscribe((responseData) => {
        if (responseData.status === 201) {
          this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
        } else {
          console.log('response data=', responseData);
          this.profile.firstName = this.form.controls.firstName.value;
          this.profile.language = 'en';
          console.log('profile=', this.profile);
          this.dataSvc.addProfilePersonal(this.profile) // TODO: for some reason when going to get the token for this, it is an old token
          .subscribe((data) => {
            this.showSpinner = false;
            this.shared.openSnackBar('Credentials saved.  Please sign in', 'message');
            this.activateBackArrowSvc.setBackRoute('landing-page');
            this.router.navigateByUrl('/signin');
          });
        }
      }, error => {
        this.showSpinner = false;
        console.log('in error!', error);
        this.httpError = true;
        if (error.status === 401) {
          this.httpErrorText = 'Invalid email address or password';
        } else {
          if (error.status === 403) {
            this.httpErrorText = 'Email address already registered';
            this.signinBtnVisibleSvc.toggleSigninButtonVisible(true);
          } else {
            this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
          }
        }
      });
    }
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
