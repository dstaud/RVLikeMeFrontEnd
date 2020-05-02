import { Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService, ItokenPayload } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LanguageService } from '@services/language.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService } from '@services/share-data.service';

import { SharedComponent } from '@shared/shared.component';


@Component({
  selector: 'app-rvlm-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  // Variable passed from the dialog when on desktop through this component's selector in the dialog compoment template
  @Input('containerDialog') containerDialog: boolean;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  form: FormGroup;
  hidePassword: boolean = true;
  httpError: boolean = false;
  httpErrorText: string = 'No Error';

  showSpinner = false;

  private userProfile: Observable<IuserProfile>;
  private returnRoute: string = '';
  private credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    active: true,
    nbrLogins: 0,
    admin: false,
    tokenExpire: 0
  };

  constructor(private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private profileSvc: ProfileService,
              private headerVisibleSvc: HeaderVisibleService,
              private shared: SharedComponent,
              private ShareDataSvc: ShareDataService,
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
    if (!this.ShareDataSvc.getData()) { // Unless came from landing-page, go back to landing-page.
      this.router.navigateByUrl('');
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);

      this.setReturnRoute();
    }
  }

  ngOnDestroy() {};


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


   // For desktop only, have cancel button because in a dialog
   onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }


  onForgotUserID() {
    console.log('forgot User ID');
  }

  onForgotPassword() {
    console.log('forgot Password');
  }


  // Signin processing
  onSubmit() {
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    this.httpError = false;
    this.httpErrorText = '';
    this.showSpinner = true;

    // Login the user
    this.authSvc.login(this.credentials)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      // Once logged in, get the users profile for distribution throughout the app
      console.log('SigninComponent:onSubmit response=', responseData);
      if (responseData.admin) {
        this.authSvc.setUserToAdmin(true);
      }
      this.profileSvc.getProfile();
      this.listenForUserProfile();
    }, error => {
      this.showSpinner = false;
      this.authSvc.setUserToAuthorized(false);
      console.log('in error!', error);
      this.httpError = true;
      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else if (error.status === 403) {
        this.httpErrorText = 'This account was deactivated';
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


  // If user used a bookmark to go to a certain page, go there after valid signin
  private handleReturnRoute() {
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
        let params = '{"nbrLogins":"' + this.credentials.nbrLogins + '"}';
        this.ShareDataSvc.setData(params);
        this.router.navigateByUrl('/home/dashboard');
        this.activateBackArrowSvc.setBackRoute('');
      }
    }
  }


  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profileResult => {
      this.setLanguage(profileResult);
      this.setColorTheme(profileResult);
      this.authSvc.setUserToAuthorized(true);
      this.showSpinner = false;
      this.handleReturnRoute();

    }, error => {
      console.error('SigninComponent:onSubmit: Error authorizing ', error);
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
      this.language.setLanguage('en');
      this.themeSvc.setGlobalColorTheme('light-theme')
      this.shared.openSnackBar('It looks like you are having trouble connecting to the Internet','error', 5000);
    });
  }


  // Set dark/light color theme based on user preference or default of light-theme.
  private setColorTheme(profile) {
    if (profile.colorThemePreference) {
      this.themeSvc.setGlobalColorTheme(profile.colorThemePreference);
    } else {
      this.themeSvc.setGlobalColorTheme('light-theme');
    }
  }


  // Set user chosen language or set to default of US English
  private setLanguage(profile) {
    if (profile.language) {
      console.log('Signin, set language to ', profile.language);
      this.language.setLanguage(profile.language);
    } else {
      console.log('Signin, set language to default');
      this.language.setLanguage('en');
    }
  }


  private setReturnRoute() {
    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(routeResult => {
      this.returnRoute = routeResult.valueOf();
      if (this.returnRoute) {
        if (this.returnRoute.substring(0, 1) === '*') {
            this.returnRoute = this.returnRoute.substring(1, this.returnRoute.length);
        }
      }
    });
  }
}
