import { Isignin } from './../../core/services/share-data.service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { environment } from '@environments/environment';

import { AuthenticationService, ItokenPayload } from '@services/data-services/authentication.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LanguageService } from '@services/language.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService, Idashboard } from '@services/share-data.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';
import { PrivacyPolicyDialogComponent } from '@dialogs/privacy-policy-dialog/privacy-policy-dialog.component';
import { TermsDialogComponent } from '@dialogs/terms-dialog/terms-dialog.component';


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
  privacyPolicyLink: string;
  termsLink: string;

  showSpinner = false;
  showSignin = true;
  showPasswordReset = false;

  private device: string;
  private install: boolean;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private returnRoute: string = '';
  private nbrLogins: number;
  private windowWidth: number;
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
              private deviceSvc: DeviceService,
              private language: LanguageService,
              private dialog: MatDialog,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: '', disabled: this.showSpinner},
                                          [Validators.required, Validators.email]),
                password: new FormControl({value: '', disabled: this.showSpinner},
                                           Validators.required)
              });
              if (this.containerDialog) {
                this.headerVisibleSvc.toggleHeaderVisible(false);
                this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
              } else {
                this.headerVisibleSvc.toggleHeaderVisible(true);
                this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
                this.activateBackArrowSvc.setBackRoute('', 'forward');
              }
              this.setReturnRoute();
  }

  ngOnInit() {
    this.windowWidth = window.innerWidth;

    let params: Isignin = this.ShareDataSvc.getData('signin');
    console.log('SigninComponent: device params=', params);
    this.install = params.install;
    this.device = params.installDevice;
  }

  ngOnDestroy() {};


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  onActivateEmail() {
    let sendTo = this.credentials.email;
    let toFirstName = null;

    this.showSpinner = true;
    this.emailSmtpSvc.sendRegisterEmail(sendTo, toFirstName, this.token)
    .subscribe(emailResult => {
      this.showSpinner = false;
      this.shared.openSnackBar('An email was sent to ' + this.form.controls.username.value + '.  Please see the email to complete activation of your account.', 'message', 8000);

      if (this.containerDialog) {
        this.formCompleted = 'complete';
        this.formComplete.emit(this.formCompleted);
      } else {
        this.headerVisibleSvc.toggleHeaderVisible(false);
        this.router.navigateByUrl('');
      }
    }, error => {
      console.error('SigninComponent:onActivateEmail: error sending email: ', error);
    })
  }

  onBackFromReset(event: any) {
    this.showPasswordReset = false;
    this.showSignin = true;
  }


   // For desktop only, have cancel button because in a dialog
   onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }


  onDocument(document) {
    if (document === 'privacy') {
      if (this.windowWidth > 600) {
        this.openPrivacyPolicyDialog(this.containerDialog, (result: string) => {
          if (result === 'complete') {
            this.activateBackArrowSvc.setBackRoute('signin', 'forward');
            this.router.navigateByUrl('/privacy-policy');
          }
        });
      } else {
        this.activateBackArrowSvc.setBackRoute('signin', 'forward');
        this.router.navigateByUrl('/privacy-policy');
      }
    } else if (document === 'terms') {
      if (this.windowWidth > 600) {
        this.openTermsOfServiceDialog(this.containerDialog, (result: string) => {
          if (result === 'complete') {
            this.activateBackArrowSvc.setBackRoute('signin', 'forward');
            this.router.navigateByUrl('/terms-of-service');
          }
        });
      } else {
        this.activateBackArrowSvc.setBackRoute('signin', 'forward');
        this.router.navigateByUrl('/terms-of-service');
      }
    }
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
    this.form.disable();

    // Login the user
    this.authSvc.login(this.credentials)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {
      // Once logged in, get the users profile for distribution throughout the app
      if (responseData.admin) {
        this.authSvc.setUserToAdmin(true);
      }
      this.nbrLogins = responseData.nbrLogins;
      this.profileSvc.getProfile();
      this.authSvc.setUserToAuthorized(true);

      this.updateInstallFlag();

      this.showSpinner = false;
      this.handleReturnRoute();
    }, error => {
      this.showSpinner = false;
      this.form.enable();
      this.authSvc.setUserToAuthorized(false);
      this.httpError = true;
      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else if (error.status === 403) {
        this.notActive = true;
        this.token = JSON.parse(error.message).token
        console.log('SigninComponent:onSubmit token=', this.token)
        this.httpErrorText = 'This account is not yet active.  Please check for an email from rvlikeme.com to activate.  If you do not see the email, look in your spam or trash folders.';
      } else {
        this.httpErrorText = 'Please connect to Internet and retry';
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
    let params: Idashboard = {
      nbrLogins: this.nbrLogins
    }

    if (this.returnRoute && this.returnRoute !== '') {
      // User booked-marked a specific page which can route too after authorization
      this.formCompleted = 'complete';
      this.formComplete.emit(this.formCompleted);
      this.activateBackArrowSvc.setBackRoute('');
      this.router.navigateByUrl(this.returnRoute);
    } else {
      if (this.containerDialog) {
        this.formCompleted = 'complete';
        this.formComplete.emit(this.formCompleted);
      } else {
        // After user authorizied go to home page
        this.ShareDataSvc.setData('dashboard', params);
        this.router.navigateByUrl('/home/dashboard');
        this.activateBackArrowSvc.setBackRoute('');
      }
    }
  }


  private openPrivacyPolicyDialog(containerDialog, cb: CallableFunction): void {
    const dialogRef = this.dialog.open(PrivacyPolicyDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: false,
      data: {containerDialog: true}
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }


  private openTermsOfServiceDialog(containerDialog, cb: CallableFunction): void {
    const dialogRef = this.dialog.open(TermsDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: false,
      data: {containerDialog: true}
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
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
      this.language.setLanguage(profile.language);
    } else {
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

  private updateInstallFlag() {
    this.authSvc.getUser()
    .subscribe(credentials => {
      console.log('SigninComponent:updateInstallFlag: credentials=', credentials);
      if (!credentials.install && !credentials.installDevice) {
        console.log('SigninComponent:updateInstallFlag: install=', this.install, ' device=', this.device);
        if (!this.install && this.device) {
          this.authSvc.updateInstallFlag(this.install, this.device)
          .subscribe(credentialsResult => {
            console.log('SigninComponent:updateInstallFlag: flag updated result=', credentialsResult);
          }, error => {
            console.error('SigninComponent:updateInstallFlag: error updating install flag', error);
          });
        }
      }
    }, error => {
      console.error('SigninComponent:updateInstallFlag: error=', error);
    })

  }
}
