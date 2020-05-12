import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService, ItokenPayload, ItokenResponse } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { InstallDialogComponent } from '@dialogs/install-dialog/install-dialog.component';
import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { UsingEmailService } from '@services/using-email.service';

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
  token: string;

  showSpinner = false;

  private presentInstallOption = false;
  private event: any;
  private useEmail: boolean;

  private credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    active: false,
    nbrLogins: 0,
    admin: false,
    tokenExpire: 0
  };

  private regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private shared: SharedComponent,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private dialog: MatDialog,
              private router: Router,
              private UsingEmailSvc: UsingEmailService,
              private emailSmtpSvc: EmailSmtpService,
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
}

  ngOnInit() {
    this.onBeforeInstallEventOfferInstallApp();

    this.listenForSystemConfiguration();
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

  // TODO: Better validation on format of email

  // Register user on form submit
  onSubmit() {
    this.registerUser();
  }


  // Determine if using email for registration or overriding
  private listenForSystemConfiguration() {
    this.UsingEmailSvc.useEmail
    .subscribe(useEmail => {
      console.log('RegisterUserComponent:listenForSystemConfiguration: useEmailResults', useEmail);
      this.useEmail = useEmail;
      console.log('RegisterUserComponent:listenForSystemConfiguration: useEmail=', this.useEmail);
    }, error => {
      console.log('RegisterUserComponent:listenForSystemConfiguration: error=', error);
    })
  }


  // Get the event handle when beforeInstallEvent fired that allows for app installation.
  // When fired, offer user option to install app from menu
  private onBeforeInstallEventOfferInstallApp() {
    this.event = this.beforeInstallEventSvc.beforeInstallEvent$
    this.event
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      if (data !== null) {
        this.presentInstallOption = true;
        this.event = data.valueOf();
      }
    });
  }


  // App Install Option
  private openInstallDialog(): void {
    const dialogRef = this.dialog.open(InstallDialogComponent, {
      width: '250px',
      disableClose: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result !== 'canceled') {
        this.event.prompt();

        // Wait for the user to respond to the prompt
        this.event.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('RegisterUserComponent:openInstallDialog: User accepted the install prompt');
            this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
          } else {
            console.log('RegisterUserComponent:openInstallDialog: User dismissed the install prompt');
          }
        });
      }
    });
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

    this.showSpinner = true;

    console.log('RegisterUserComponent:RegisterUser: credential=', this.credentials)
    this.authSvc.registerUser(this.credentials, this.form.controls.firstName.value)
    .pipe(untilComponentDestroyed(this))
    .subscribe((responseData) => {
      if (responseData.status === 201) {
        this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
      } else {
        console.log('RegisterUserComponent:registerUser: response=', responseData);

        if (this.useEmail) {
          this.getActivationToken();
        } else {
          this.showSpinner = false;
          this.shared.openSnackBar('You have successfully registered.  Please login.', 'message', 3000);
          this.registrationComplete();
        }
      }
    }, error => {
      this.showSpinner = false;
      this.httpError = true;
      console.log('RegisterUser:RegisterUser: error=', error);
      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else {
        if (error.status === 403) {
          this.httpErrorText = 'Email address already registered';
        } else {
          console.warn('ERROR: ', error);
          if (error.message.includes('Unknown Error')) {
            this.shared.openSnackBar('Oops! Having trouble connecting to the Internet.  Please check your connectivity settings.','error', 5000);
            this.httpErrorText = 'Please connect to Internet and try again';
          } else {
            this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
          }
        }
      }
    });
  }

  // Log user out to clear token and go to the landing page
  private registrationComplete() {
    let self = this;

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
  }

  private getActivationToken() {
    let noExpire: boolean = true;

    this.authSvc.getPasswordResetToken(this.credentials.email, noExpire, 'activation')
    .subscribe(tokenResult => {
      console.log('ForgotPasswordComponent:onSubmit: tokenResult=', tokenResult);
        this.sendRegisterEmail(tokenResult.token);
    }, error => {
      console.log('ForgotPasswordComponent:onSubmit: error getting token=', error);
      throw new Error(error);
    });
  }


  private sendRegisterEmail(token: string) {
    let sendTo = this.credentials.email;
    let toFirstName = this.form.controls.firstName.value;

    console.log('RegisterUser:sendRegisterEmail: token=', token);
    this.emailSmtpSvc.sendRegisterEmail(sendTo, toFirstName, token)
    .subscribe(emailResult => {
      console.log('email sent!  result=', emailResult);
      this.showSpinner = false;
      this.shared.openSnackBar('An email was sent to ' + this.form.controls.email.value + '.  Please see the email to complete activation of your account.', 'message', 8000);
      this.registrationComplete();
    }, error => {
      console.log('RegisterUser:sendRegisterEmail: error sending email: ', error);
      this.showSpinner = false;
      this.httpError = true;
      this.httpErrorText = "Unable to send registration email.  Please contact dave@rvlikeme.com";
      this.authSvc.logout();
    })
  }
}
