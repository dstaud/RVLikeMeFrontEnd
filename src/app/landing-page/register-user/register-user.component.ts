import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { DeviceService } from '@services/device.service';
import { BeforeInstallEventService } from '@services/before-install-event.service';
import { InstallDialogComponent } from '@dialogs/install-dialog/install-dialog.component';

import { ItokenPayload } from '@interfaces/tokenPayload';

import { SharedComponent } from '@shared/shared.component';


@Component({
  selector: 'app-rvlm-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {

  // Variable passed from the dialog when on desktop through this component's selector in the dialog compoment template
  @Input('containerDialog')
  containerDialog = false;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  form: FormGroup;
  hidePassword = true;
  showSpinner = false;
  arrowIcon = 'arrow_back';
  httpError = false;
  httpErrorText = '';

  private device: string;
  private presentInstallOption = false;
  private event: any;

  private credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    tokenExpire: 0
  };
  private profile: IuserProfile = {
    firstName: null,
    lastName: null,
    displayName: null,
    yearOfBirth: null,
    gender: null,
    homeCountry: null,
    homeState: null,
    myStory: null,
    language: 'en',
    colorThemePreference: 'light-theme',
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null,
    rigType: null,
    rigManufacturer: null,
    rigBrand: null,
    rigModel: null,
    rigYear: null,
    profileImageUrl: null
  };

  constructor(private authSvc: AuthenticationService,
              private profileSvc: ProfileService,
              private deviceSvc: DeviceService,
              private shared: SharedComponent,
              private beforeInstallEventSvc: BeforeInstallEventService,
              private dialog: MatDialog,
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
    this.device = this.deviceSvc.device;

    if (this.device === 'iPhone') {
      // arrow_back_ios icon not coming up at all regardless of this if
      // this.arrowIcon = 'arrow_back_ios';
      this.arrowIcon = 'keyboard_arrow_left';
    }

    // Get the event handle when beforeInstallEvent fired that allows for app installation.
    // When fired, offer user option to install app from menu
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

  ngOnDestroy() {};

  // For desktop only, have cancel button because in a dialog
  onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
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
      .pipe(untilComponentDestroyed(this))
      .subscribe((responseData) => {
        if (responseData.status === 201) {
          this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
        } else {
          this.profile.firstName = this.form.controls.firstName.value;
          this.profile.language = 'en';
          this.profile.colorThemePreference = 'light-theme';
          console.log('calling add profile:', this.profile);
          this.profileSvc.addProfile(this.profile)
          .pipe(untilComponentDestroyed(this))
          .subscribe((data) => {
            this.showSpinner = false;
            if (this.presentInstallOption) {
              // Show the install prompt
              this.openInstallDialog();
            } else if (!this.containerDialog) {
              this.shared.openSnackBar('Credentials saved.  Please sign in', 'message', 2000);
            }
            this.authSvc.logout();
            if (this.containerDialog) {
              this.formCompleted = 'complete';
              this.formComplete.emit(this.formCompleted);
            } else {
              this.activateBackArrowSvc.setBackRoute('landing-page');
              this.router.navigateByUrl('/signin');
            }
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
          } else {
            this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
          }
        }
      });
    }
  }

  // App Install Option
  openInstallDialog(): void {
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
            console.log('User accepted the install prompt');
            this.beforeInstallEventSvc.saveBeforeInstallEvent(null);
          } else {
            console.log('User dismissed the install prompt');
          }
        });
      }
    });
  }

  returnToBackRoute() {
    this.router.navigateByUrl('/');
    this.activateBackArrowSvc.setBackRoute('');
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
