import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
// import { MatDialogRef } from '@angular/material/dialog';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { SharedComponent } from './../../shared/shared.component';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';

@Component({
  selector: 'app-rvlm-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
  providers: [AuthenticationService]
})
export class RegisterUserComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  showSpinner = false;
  credentials: ItokenPayload = {
    email: '',
    firstName: '',
    password: ''
  };
  httpError = false;
  httpErrorText = 'No Error';

  constructor(private signinBtnVisibleSvc: SigninButtonVisibleService,
              private authSvc: AuthenticationService,
              // private dialogRef: MatDialogRef<RegisterDialogComponent>,
              private shared: SharedComponent,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required),
                passwordConfirm: new FormControl('', Validators.required)
              });
}

  @Input() state: boolean;
  @Output() toggle = new EventEmitter<boolean>();

  ngOnInit() {
  }

  onSubmit() {
    this.credentials.email = this.form.controls.email.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    this.credentials.firstName = this.form.controls.firstName.value;

    this.showSpinner = true;
    this.authSvc.registerUser(this.credentials)
/*     .pipe(
      catchError (this.authSvc.handleBackendError)
    ) */
    .subscribe((responseData) => {
      this.showSpinner = false;
      if (responseData.status === 201) {
        this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
      } else {
        this.shared.openSnackBar('Credentials saved successfully', 'message');
        this.onClose();
      }
    }, error => {
      this.showSpinner = false;
      console.log('in error!', error);
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

  onClose() {
    // this.dialogRef.close();
    this.toggle.emit(!this.state);
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
