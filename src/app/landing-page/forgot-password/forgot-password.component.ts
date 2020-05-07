import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UUID } from 'angular2-uuid';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { EmailSmtpService } from '@services/data-services/email-smtp.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

@Component({
  selector: 'app-forgot-password',
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

  private resetID: UUID;

  constructor(private emailSmtpSvc: EmailSmtpService,
              private authSvc: AuthenticationService,
              private router: Router,
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
    let resetID: string;
    let userEmail: string;
    let noExpire = false;

    userEmail = this.form.controls.userEmail.value;
    this.authSvc.getPasswordResetToken(userEmail, noExpire)
    .subscribe(tokenResult => {
      console.log('ForgotPasswordComponent:onSubmit: tokenResult=', tokenResult);
        this.emailSmtpSvc.sendPasswordResetEmail(userEmail, tokenResult.token)
        .subscribe(sendEmailResult => {
          console.log('ForgotPasswordComponent:onSubmit: sendEmailResult=',sendEmailResult);
        }, error => {
          console.log('ForgotPasswordComponent:onSubmit: sending email=', error);
          throw new Error(error);
        });
    }, error => {
      console.log('ForgotPasswordComponent:onSubmit: error getting token=', error);
      throw new Error(error);
    });

    if (this.containerDialog) {
      this.formCompleted = 'complete';
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.formComplete.emit(this.formCompleted);
    } else {
      // After email sent, go to home page
      this.headerVisibleSvc.toggleHeaderVisible(false);
      this.router.navigateByUrl('/');
    }
  }
}
