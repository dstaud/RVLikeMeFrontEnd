import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LanguageService } from '@services/language.service';
import { ThemeService } from '@services/theme.service';

import { ItokenPayload } from '@interfaces/tokenPayload';
import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  // Variable passed from the dialog when on desktop through this component's selector in the dialog compoment template
  @Input('containerDialog')
  containerDialog = false;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

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
              private headerVisibleSvc: HeaderVisibleService,
              private shared: SharedComponent,
              private router: Router,
              private themeSvc: ThemeService,
              private language: LanguageService,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: '', disabled: this.showSpinner},
                                          [Validators.required, Validators.email]),
                password: new FormControl({value: '', disabled: this.showSpinner},
                                           Validators.required)
              });
  }

  ngOnInit() {
    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in Signin return=', data);
      this.returnRoute = data.valueOf();
      if (this.returnRoute) {
        if (this.returnRoute.substring(0, 1) === '*') {
            this.returnRoute = this.returnRoute.substring(1, this.returnRoute.length);
        }
      }
    });
   }

  ngOnDestroy() {};

   // For desktop only, have cancel button because in a dialog
   onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }

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
        if (data.colorThemePreference) {
          this.themeSvc.setGlobalColorTheme(data.colorThemePreference);
        } else {
          this.themeSvc.setGlobalColorTheme('light-theme');
        }
        this.showSpinner = false;
        this.authSvc.setUserToAuthorized(true);
        if (this.returnRoute && this.returnRoute !== 'landing-page') {
          // User booked-marked a specific page which can route too after authorization
          this.router.navigateByUrl(this.returnRoute);
          this.activateBackArrowSvc.setBackRoute('');
        } else {
          if (this.containerDialog) {
            this.formCompleted = 'complete';
            this.formComplete.emit(this.formCompleted);
          } else {
            // After user authorizied go to home page
            this.router.navigateByUrl('/home');
            this.activateBackArrowSvc.setBackRoute('');
          }
        }
      }, (error) => {
        console.error(error);
        this.showSpinner = false;
        this.httpError = true;
        this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
        this.language.setLanguage('en');
        this.themeSvc.setGlobalColorTheme('light-theme')
        console.log('error ', error);
        this.shared.openSnackBar('It looks like you are having trouble connecting to the Internet','error', 5000);
      });
    }, error => {
      this.showSpinner = false;
      this.authSvc.setUserToAuthorized(false);
      console.log('in error!', error);
      this.httpError = true;
      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else {
        this.httpErrorText = 'Please connect to Internet and retry';
        console.warn('ERROR: ', error);
        if (error.message.includes('Unknown Error')) {
          this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
          this.httpErrorText = 'Please connect to Internet and try again';
        } else {
          this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
        }
      }
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
