import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';

import { take, takeUntil } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { DataService } from '@services/data-services/data.service';
import { SigninButtonVisibleService } from '@services/signin-btn-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { ItokenPayload } from '@interfaces/tokenPayload';
import { Iuser } from '@interfaces/user';

import { SharedComponent } from '@shared/shared.component';


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

  ngOnDestroy() {};

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
      .pipe(untilComponentDestroyed(this))
      .subscribe((responseData) => {
        if (responseData.status === 201) {
          this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
        } else {
          this.profile.firstName = this.form.controls.firstName.value;
          this.profile.language = 'en';
          this.dataSvc.addProfilePersonal(this.profile)
          .pipe(untilComponentDestroyed(this))
          .subscribe((data) => {
            this.showSpinner = false;
            this.shared.openSnackBar('Credentials saved.  Please sign in', 'message');
            this.activateBackArrowSvc.setBackRoute('landing-page');
            this.router.navigateByUrl('/signin');
          });
        }
      }, error => {
        this.showSpinner = false;
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
