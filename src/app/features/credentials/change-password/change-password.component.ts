import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { PasswordVerifyComponent } from './../password-verify/password-verify.component';

import { AuthenticationService, ItokenPayload } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild(PasswordVerifyComponent)
  public passwordVerify: PasswordVerifyComponent;

  form: FormGroup;
  hidePassword: boolean = true;
  httpError: boolean = false;
  httpErrorText: string = 'No Error';
  passwordTouched = false;
  showSpinner: boolean = false;
  desktopUser: boolean = false;

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
              private translate: TranslateService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private device: DeviceService,
              fb: FormBuilder) {
              this.form = fb.group({
                currentPassword: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)]),
                newPassword: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)])
              });
              if (window.innerWidth >=600) {
                this.desktopUser = true;
              }
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
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.getCredentials();
    }
  }

  ngOnDestroy() {}

  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let topSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    if (this.desktopUser) {
      topSpacing = 'desktop-spacing';
    } else {
      topSpacing = 'device-spacing';
    }

    containerClass = 'container ' + bottomSpacing + ' ' + topSpacing;

    return containerClass;
  }


  onSubmit() {
    let self = this;
    this.form.disable();
    this.showSpinner = true;

    this.newCredentials.email = this.credentials.email;
    this.newCredentials.password = this.form.controls.currentPassword.value;
    this.newCredentials.newPassword = this.form.controls.newPassword.value;

    this.authSvc.changePassword(this.newCredentials)
    .pipe(untilComponentDestroyed(this))
    .subscribe(passwordResult => {
      this.httpError = false;
      this.showSpinner = false;
      this.shared.openSnackBar(this.translate.instant('changePassword.component.success'), 'message', 5000);

      setTimeout(function () {
        self.router.navigateByUrl('/home/main');
      }, 2000);

    }, error => {
      if (error.status === 401) {
        this.httpError = true;
        this.httpErrorText = this.translate.instant('changePassword.component.notValid');
        this.showSpinner = false;
        this.form.enable();
      } else {
        this.showSpinner = false;
        this.shared.notifyUserMajorError(error);
        throw new Error(JSON.stringify(error));
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
      this.showSpinner = false;
      this.form.enable();
    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
    });
  }

}
