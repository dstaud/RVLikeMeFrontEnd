import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';

import { ItokenPayload } from '@services/data-services/authentication.service';
import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-change-username',
  templateUrl: './change-username.component.html',
  styleUrls: ['./change-username.component.scss']
})
export class ChangeUsernameComponent implements OnInit {
  form: FormGroup;
  hidePassword: boolean = true;
  httpError = false;
  httpErrorText = '';

  showSpinner = false;
  showPassword = false;

  private originalUsername: string;
  private newCredentials = {
    email: '',
    password: '',
    newEmail: '',
  };

  constructor(private authSvc: AuthenticationService,
              private shared: SharedComponent,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required)
              })
}

  ngOnInit() {
    this.form.disable();
    this.showSpinner = true;

    this.getCredentials();
  }

  ngOnDestroy() {};


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  // Update user name in database
  onSubmit() {
    if (this.form.controls.username.value === this.originalUsername) {
      this.httpError = true;
      this.httpErrorText = "You did not change  your email address";
    } else {
      this.showSpinner = true;
      this.newCredentials.email = this.originalUsername;
      this.newCredentials.newEmail = this.form.controls.username.value.toLowerCase();
      this.newCredentials.password = this.form.controls.password.value;
      this.httpError = false;
      this.httpErrorText = '';
      this.authSvc.changeUsername(this.newCredentials)
      .pipe(untilComponentDestroyed(this))
      .subscribe ((responseData) => {
        this.showSpinner = false;
        this.shared.openSnackBar('Username updated successfully', 'message');
      }, error => {
        this.showSpinner = false;
        console.log('in error!', error);
        this.httpError = true;
        if (error.status === 401) {
          this.httpErrorText = 'Invalid email address or password';
        } else if (error.status === 403) {
          this.httpErrorText = 'Email already exists';
        } else {
          console.log('ChangeUsernameComponent:onSubmit: throw error ', error);
          throw new Error(error);
        }
      });
    }
  }


  // Get username from database
  private getCredentials() {
    this.authSvc.getUser()
    .pipe(take(1))
    .subscribe(credentials => {
      this.form.patchValue({
        username: credentials.email
      });
      this.originalUsername = credentials.email;
      this.showSpinner = false;
      this.form.enable();
    }, error => {
      this.showSpinner = false;
      console.error('ChangeUsernameComponent:getCredentials: error getting user credentials ', error);
      throw new Error(error);
    });
  }
}
