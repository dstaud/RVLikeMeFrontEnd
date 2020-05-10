import { Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { UUID } from 'angular2-uuid';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService, ItokenPayload } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LanguageService } from '@services/language.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService } from '@services/share-data.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';

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
  notActive: boolean = false;
  httpError: boolean = false;
  httpErrorText: string = 'No Error';
  token: string;

  showSpinner = false;
  showSignin = true;
  showPasswordReset = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private returnRoute: string = '';
  private credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    active: false,
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
              private emailSmtpSvc: EmailSmtpService,
              private themeSvc: ThemeService,
              private language: LanguageService,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: '', disabled: this.showSpinner},
                                          [Validators.required, Validators.email]),
                password: new FormControl({value: '', disabled: this.showSpinner},
                                           Validators.required)
              });

              this.headerVisibleSvc.toggleHeaderVisible(true);
              this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
              this.setReturnRoute();
  }

  ngOnInit() {
  }

  ngOnDestroy() {};


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  onActivateEmail() {
    let sendTo = this.credentials.email;
    let toFirstName = null;

    console.log('SigninComponent:onActivateEmail: token=', this.token);
    this.emailSmtpSvc.sendRegisterEmail(sendTo, toFirstName, this.token)
    .subscribe(emailResult => {
      console.log('email sent!  result=', emailResult);
      this.shared.openSnackBar('An email was sent to ' + this.form.controls.username.value + '.  Please see the email to complete activation of your account.', 'message', 8000);

      if (this.containerDialog) {
        this.formCompleted = 'complete';
        this.formComplete.emit(this.formCompleted);
      } else {
        this.headerVisibleSvc.toggleHeaderVisible(false);
        this.router.navigateByUrl('');
      }
    }, error => {
      console.log('SigninComponent:onActivateEmail: error sending email: ', error);
    })
  }

   // For desktop only, have cancel button because in a dialog
   onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }


  onBackFromReset(event: any) {
    this.showPasswordReset = false;
    this.showSignin = true;
  }


  onForgotPassword() {
    if (this.containerDialog) {
      this.showSignin = false;
      this.showPasswordReset = true;
    } else {
      this.activateBackArrowSvc.setBackRoute('signin', 'forward');
      this.router.navigateByUrl('/forgot-password');
    }
  }


  // Signin processing
  onSubmit() {
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    this.httpError = false;
    this.httpErrorText = '';
    this.showSpinner = true;
    this.notActive = false;

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
        this.notActive = true;
        console.log('SigninComponenet:onSubmit not active, token=', JSON.parse(error.message).token);
        this.token = JSON.parse(error.message).token
        this.httpErrorText = 'This account is not yet active.  Please check for an email from rvlikeme.com to activate.  If you do not see the email, look in your spam or trash folders.';
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
    console.log('SigninComponent:handleReturnRoute: in handle return route=', this.returnRoute);
    if (this.returnRoute && this.returnRoute !== '') {
      // User booked-marked a specific page which can route too after authorization
      console.log('SigninComponent:handleReturnRoute: return route=', this.returnRoute);
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
      this.profile = profileResult;
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
    let routeStack: Array<string>;
    let i: number;

    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(routeResult => {
      routeStack = routeResult;
      i = routeStack.length - 1;
      if (routeStack.length > 0) {
        if (routeStack[i].substring(0, 1) === '*') {
            this.returnRoute = routeStack[i].substring(1, routeStack[i].length);
        }
      }
    });
  }
}
