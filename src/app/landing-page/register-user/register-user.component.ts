import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { take } from 'rxjs/operators';

import { AuthenticationService, ItokenPayload, ItokenResponse } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { UsingEmailService } from '@services/using-email.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { ShareDataService, Iregister } from '@services/share-data.service';
import { ForumService } from '@services/data-services/forum.service';

import { SharedComponent } from '@shared/shared.component';

// TODO: confirm email address by sending out
// TODO: enforce stricter passwords

@Component({
  selector: 'app-rvlm-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {

  // Variable passed from the dialog when on desktop through this component's selector in the dialog compoment template
  @Input('containerDialog') containerDialog = false;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()
  formCompleted: string;

  form: FormGroup;
  hidePassword = true;
  httpError = false;
  httpErrorText = '';
  registerPresets: Iregister;

  showSpinner = false;

  private presentInstallOption = false;
  private event: any;
  private useEmail: boolean;
  private overrideRegisterEmail: boolean = false;
  private profileID: string;

  private credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    active: false,
    nbrLogins: 0,
    admin: false,
    emailNotVerified: false,
    tokenExpire: 0
  };

  private regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private shared: SharedComponent,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private dialog: MatDialog,
              private router: Router,
              private shareDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private UsingEmailSvc: UsingEmailService,
              private emailSmtpSvc: EmailSmtpService,
              private forumSvc: ForumService,
              private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)])
                // passwordConfirm: new FormControl('', Validators.required)
              });
              this.headerVisibleSvc.toggleHeaderVisible(true);
              this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
              this.activateBackArrowSvc.setBackRoute('', 'forward');
}

  ngOnInit() {
    this.listenForSystemConfiguration();

    this.registerPresets = this.shareDataSvc.getData('register');
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


  // Register user on form submit
  onSubmit() {
    this.registerUser();
  }

  // Determine if using email for registration or overriding
  private listenForSystemConfiguration() {
    this.UsingEmailSvc.useEmail
    .pipe(untilComponentDestroyed(this))
    .subscribe(useEmail => {
      this.useEmail = useEmail;
    }, error => {
      this.sentry.logError('RegisterUserComponent:listenForSystemConfiguration: error=' + error);
    })
  }


  // Save new user information in database and store user token locally
  private registerUser() {
    this.credentials.email = this.form.controls.email.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    if (this.useEmail) {
      this.credentials.active = false;
    } else {
      this.credentials.active = true;
    }

    // If not using emails to verify users at login because of some AWS SES issue, any users registered, indicate that in the users credentials
    this.credentials.emailNotVerified = !this.useEmail;

    this.showSpinner = true;
    this.form.disable();

    this.authSvc.registerUser(this.credentials, this.form.controls.firstName.value, this.registerPresets)
    .pipe(untilComponentDestroyed(this))
    .subscribe((responseData) => {
      if (responseData.status === 201) {
        this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
      } else {
        this.profileID = responseData.profile._id;
        if (this.useEmail) {
          this.getActivationTokenWithEmail();
        } else {
          this.showSpinner = false;
          this.shared.openSnackBar('You have successfully registered.  Please login.', 'message', 3000);
          this.registrationComplete();
        }
      }
    }, error => {
      this.showSpinner = false;
      this.form.enable();
      this.httpError = true;

      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else {
        if (error.status === 403) {

          if (error.active) {
            this.httpErrorText = 'Email address is already registered.  If you have forgotten your password, click on the forgot password link on Login.';
            this.showSpinner = false;
            this.form.enable();
          } else {
            this.getActivationTokenWithEmail(true);
            this.httpErrorText = 'It looks like you already tried to register.  Another registration email was sent to ' + this.credentials.email + '. Please activate your account from this email.  Check your trash or spam folder if you cannot find the email.';
            this.showSpinner = false;
            this.form.enable();
          }
        } else {
          console.warn('ERROR: ', error);
          if (error.message.includes('Unknown Error')) {
            this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
            this.httpErrorText = 'Please connect to Internet and try again';
          } else {
            this.httpErrorText = 'An unknown error occurred. Please refresh and try again.';
          }
          this.form.enable();
        }
      }
    });
  }

  // Log user out to clear token and go to the landing page
  private registrationComplete() {
    this.addGroupsToProfile();
  }

  private getActivationTokenWithEmail(stay?: boolean) {
    let noExpire: boolean = true;

    this.authSvc.getPasswordResetToken(this.credentials.email, noExpire, 'activation')
    .pipe(untilComponentDestroyed(this))
    .subscribe(tokenResult => {
        // this.authSvc.logout();
        this.sendRegisterEmail(tokenResult.token, stay);
    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }

  private activateUser(urlToken: string) {
    this.authSvc.activateUser(urlToken)
    .pipe(untilComponentDestroyed(this))
    .subscribe(activateResult => {
      this.showSpinner = false;
      // this.authSvc.logout();
      this.shared.openSnackBar('You have successfully registered.  Please login.', 'message', 3000);
      this.registrationComplete();

    }, error => {
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = 'The activation token is invalid';
    });
  }

  private sendRegisterEmail(urlToken: string, stay?: boolean) {
    let self = this;
    let sendTo = this.credentials.email;
    let toFirstName = this.form.controls.firstName.value;

    // Been having periodic issus with AWS SES timing out and not sending any emails.  If after 20 seconds, no response, override and activate
    setTimeout(function () {
      if (self.showSpinner) {
        self.shared.openSnackBar('Sorry for the delay. We are experiencing an issue.  Please stand by for 5 more seconds.', "error", 4000);
        setTimeout(function () {
            if (!self.overrideRegisterEmail) {
              self.overrideRegisterEmail = true;
              self.activateUser(urlToken);
            }
        }, 5000);
      }
    }, 5000);

    this.emailSmtpSvc.sendRegisterEmail(sendTo, toFirstName, urlToken)
    .pipe(untilComponentDestroyed(this))
    .subscribe(emailResult => {
      this.showSpinner = false;
      if (!stay) { // Stay means user tried to register again without confirming.  Different messaging and don't want this message
        this.shared.openSnackBar('An email was sent to ' + this.form.controls.email.value + '.  Please see the email to complete activation of your account.', 'message', 8000);
        this.registrationComplete();
      }
    }, error => {
      // If AWS failure to send email, attempt to activate user anyway.  Email failure will be logged so can tell if have registered user but email not really verified.

      if (!this.overrideRegisterEmail) {
        this.overrideRegisterEmail = true;
        this.activateUser(urlToken);
      }
    })
  }

  private sendWelcomeEmail(email: string, token: string) {
    let sendTo = email;
    let toFirstName = null;
    this.emailSmtpSvc.sendWelcomeEmail(sendTo, toFirstName, token)
    .pipe(untilComponentDestroyed(this))
    .subscribe(emailResult => {
      this.showSpinner = false;
      // this.authSvc.logout();
      this.shared.openSnackBar('You have successfully registered.  Please login.', 'message', 3000);
      this.registrationComplete();
    }, error => {
      this.sentry.logError('RegisterComponent:sendWelcomeEmail: error sending email: ' + JSON.stringify(error));
      this.shared.openSnackBar('You have successfully registered.  Please login.', 'message', 3000);
      this.registrationComplete();
    });
  }

  private addGroupsToProfile() {
    let self = this;

    this.profileSvc.addGroupsToProfile(this.profileID, this.registerPresets)
    .pipe(untilComponentDestroyed(this))
    .subscribe ((responseData) => {

      setTimeout(function () {
        self.authSvc.logout();

        if (self.containerDialog) {
          self.formCompleted = 'complete';
          self.formComplete.emit(self.formCompleted);
        } else {
          self.headerVisibleSvc.toggleHeaderVisible(false);
          self.router.navigateByUrl('/signin');
        }
      }, 2000);
    }, error => {
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }
}
