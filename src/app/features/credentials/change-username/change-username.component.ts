import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DeviceService } from '@services/device.service';

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
              private location: Location,
              private router: Router,
              private activateBackArrowSvc: ActivateBackArrowService,
              private device: DeviceService,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required)
              })
}

  ngOnInit() {
    let backPath;
    let self = this;

    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.form.disable();
      this.showSpinner = true;

      this.getCredentials();
    }
  }

  ngOnDestroy() {};


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
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
        this.httpError = true;
        if (error.status === 401) {
          this.httpErrorText = 'Invalid email address or password';
        } else if (error.status === 403) {
          this.httpErrorText = 'Email already exists';
        } else {
          console.error('ChangeUsernameComponent:onSubmit: throw error ', error);
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
