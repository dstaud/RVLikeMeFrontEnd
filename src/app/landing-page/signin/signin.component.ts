import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';

import { take, takeUntil } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { DataService } from './../../core/services/data-services/data.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { Iuser } from './../../interfaces/user';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';
import { LanguageService } from './../../core/services/language.service';

@Component({
  selector: 'app-rvlm-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  user: Iuser;
  form: FormGroup;
  hidePassword = true;
  credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    tokenExpire: 0
  };
  showSpinner = false;
  httpError = false;
  httpErrorText = 'No Error';
  returnRoute = '';

  constructor(private authSvc: AuthenticationService,
              private dataSvc: DataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private translate: TranslateService,
              private language: LanguageService,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: '', disabled: this.showSpinner},
                                          [Validators.required, Validators.email]),
                password: new FormControl({value: '', disabled: this.showSpinner},
                                           Validators.required)
              });
  }

  ngOnInit() {
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.returnRoute = data.valueOf();
      if (this.returnRoute) {
        if (this.returnRoute.substring(0, 1) === '*') {
            this.returnRoute = this.returnRoute.substring(1, this.returnRoute.length);
        }
      }
    });
  }

  ngOnDestroy() {};

  onSubmit() {
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    this.httpError = false;
    this.httpErrorText = '';
    this.showSpinner = true;
    this.authSvc.login(this.credentials)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      this.dataSvc.getProfilePersonal()
      .pipe(untilComponentDestroyed(this))
      .subscribe(user => {
        if (user.language) {
          this.language.setLanguage(user.language);
        } else {
          this.language.setLanguage('en');
        }
        this.showSpinner = false;
      }, (error) => {
          this.showSpinner = false;
          console.error(error);
          this.httpError = true;
          this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
      });
      this.showSpinner = false;
      this.authSvc.setUserToAuthorized(true);
      if (this.returnRoute && this.returnRoute !== 'landing-page') {
        // User booked-marked a specific page which can route too after authorization
        this.router.navigateByUrl(this.returnRoute);
        this.activateBackArrowSvc.setBackRoute('');
      } else {
        // After user authorizied to to home page
        this.router.navigateByUrl('/home');
        this.activateBackArrowSvc.setBackRoute('');
      }
    }, error => {
      this.showSpinner = false;
      this.authSvc.setUserToAuthorized(false);
      console.log('in error!', error);
      this.httpError = true;
      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else {
        this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
      }
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
