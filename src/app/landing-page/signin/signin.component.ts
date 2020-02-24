import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { SigninButtonVisibleService } from '@services/signin-btn-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LanguageService } from '@services/language.service';

import { ItokenPayload } from '@interfaces/tokenPayload';

@Component({
  selector: 'app-rvlm-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  userProfile: Observable<IuserProfile>;
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
              private activateBackArrowSvc: ActivateBackArrowService,
              private profileSvc: ProfileService,
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
      // Get user profile
      this.userProfile = this.profileSvc.profile;
      console.log('get profile')
      this.profileSvc.getProfile();
      this.userProfile
      .pipe(untilComponentDestroyed(this))
      .subscribe(data => {
        console.log('in login component=', data);
        if (data.language) {
          this.language.setLanguage(data.language);
        } else {
          this.language.setLanguage('en');
        }
        this.showSpinner = false;
        this.authSvc.setUserToAuthorized(true);
        if (this.returnRoute && this.returnRoute !== 'landing-page') {
          // User booked-marked a specific page which can route too after authorization
          this.router.navigateByUrl(this.returnRoute);
          this.activateBackArrowSvc.setBackRoute('');
        } else {
          // After user authorizied go to home page
          this.router.navigateByUrl('/home');
          this.activateBackArrowSvc.setBackRoute('');
        }
      }, (error) => {
        console.error(error);
        this.showSpinner = false;
        this.httpError = true;
        this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
        this.language.setLanguage('en');
      });
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
