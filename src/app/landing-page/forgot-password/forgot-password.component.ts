import { finalize } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  // Variable passed from the dialog when on desktop through this component's selector in the dialog compoment template
  @Input('containerDialog') containerDialog: boolean;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  form: FormGroup;
  showSpinner: boolean = false;
  httpError: boolean = false;
  httpErrorText: string = 'No Error';

  constructor(private emailSmtpSvc: EmailSmtpService,
              private authSvc: AuthenticationService,
              private router: Router,
              private shared: SharedComponent,
              private headerVisibleSvc: HeaderVisibleService,
              fb: FormBuilder) {
              this.form = fb.group({
                userEmail: new FormControl({value: '', disabled: this.showSpinner},
                                          [Validators.required, Validators.email])
              });
}

  ngOnInit(): void {
  }

  ngOnDestroy() {}


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  // For desktop only, have cancel button because in a dialog
  onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }


  onSubmit() {
    this.form.disable();
    let userEmail: string;
    let noExpire = false;
    let self = this;

    userEmail = this.form.controls.userEmail.value;
    this.authSvc.getPasswordResetToken(userEmail, noExpire, 'password-reset')
    .subscribe(tokenResult => {
      console.log('ForgotPasswordComponent:onSubmit: tokenResult=', tokenResult);
      this.sendPasswordResetEmail(userEmail, tokenResult.token);
      this.shared.openSnackBar('An email has been sent to this email address to reset your password', 'message', 8000);

      setTimeout(function () {
        self.finalize();
      }, 2000);

    }, error => {
      console.error('ForgotPasswordComponent:onSubmit: error getting token=', error, ' status=', error.status);
      if (error.status === 406) {
        this.httpError = true;
        this.httpErrorText = 'Email does not exist in database';
        this.form.enable();
      } else {
        console.error('ForgotPasswordComponent:onSubmit: error =', error.message);
        throw new Error(error);
      }
    });
  }


  private finalize() {
    this.formCompleted = 'complete';
    this.formComplete.emit(this.formCompleted);
  }

  private sendPasswordResetEmail(userEmail: string, token:string) {
    this.emailSmtpSvc.sendPasswordResetEmail(userEmail, token)
    .subscribe(sendEmailResult => {
      console.log('ForgotPasswordComponent:onSubmit: sendEmailResult=',sendEmailResult);
    }, error => {
      console.log('ForgotPasswordComponent:onSubmit: sending email=', error);
      throw new Error(error);
    });
  }
}
