import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService, ItokenPayload } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  hidePassword: boolean = true;
  httpError: boolean = false;
  httpErrorText: string = 'No Error';
  showSpinner: boolean = false;

  private credentials: ItokenPayload;
  private newCredentials = {
    email: '',
    password: '',
    newPassword: '',
  };

  private regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  constructor(private authSvc: AuthenticationService,
              private router: Router,
              private shared: SharedComponent,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              fb: FormBuilder) {
              this.form = fb.group({
                currentPassword: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)]),
                newPassword: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)])
              });
}

  ngOnInit(): void {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };
    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/signin');
    } else {
      this.getCredentials();
    }
  }

  ngOnDestroy() {}

  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

  onSubmit() {
    let self = this;
    this.form.disable();
    this.showSpinner = true;

    this.newCredentials.email = this.credentials.email;
    this.newCredentials.password = this.form.controls.currentPassword.value;
    this.newCredentials.newPassword = this.form.controls.newPassword.value;

    console.log('ChangePasswordComponent:onSubmit: credentials=', this.newCredentials);
    this.authSvc.changePassword(this.newCredentials)
    .pipe(untilComponentDestroyed(this))
    .subscribe(passwordResult => {
      console.log('ChangePasswordComponent:onSubmit: result=', passwordResult);
      this.httpError = false;
      this.showSpinner = false;
      this.shared.openSnackBar('Your password has been updated successfully', 'message', 5000);

      setTimeout(function () {
        self.router.navigateByUrl('/home/dashboard');
      }, 2000);

    }, error => {
      if (error.status === 401) {
        this.httpError = true;
        this.httpErrorText = 'Current password is not valid';
        // this.form.controls.currentPassword.setErrors({required: false});
        this.showSpinner = false;
        this.form.enable();
      } else {
        console.log('ChangePasswordComponent:onSubmit: error changing password=', error);
        this.showSpinner = false;
        throw new Error(error);
      }
    })
  }

  // Get username from database
  private getCredentials() {
    this.showSpinner = true;
    this.form.disable();

    this.authSvc.getUser()
    .pipe(take(1))
    .subscribe(credentials => {
      this.credentials = credentials;
      console.log('ChangePasswordComponent:getCredentials: credentials=', this.credentials);
      this.showSpinner = false;
      this.form.enable();
    }, error => {
      this.showSpinner = false;
      console.error('ChangePasswordComponent:getCredentials: error getting user credentials ', error);
      throw new Error(error);
    });
  }

}
