import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { SharedComponent } from '@shared/shared.component';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-rvlm-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  form: FormGroup;
  landingImage: string;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';
  httpError: boolean = false;
  httpErrorText: string = 'No Error';
  hidePassword: boolean = true;
  showSpinner: boolean = false;

  private windowWidth: number;
  private routeSubscription: any;
  private token: string;
  private tokenID: string;

  private regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private route: ActivatedRoute,
              private authSvc: AuthenticationService,
              private shared: SharedComponent,
              private ActivateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private sentry: SentryMonitorService,
              fb: FormBuilder) {
              this.form = fb.group({
                password: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)])
              });
}

  ngOnInit(): void {
    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }


  onSubmit() {
    this.showSpinner = true;
    let self = this;

    this.form.disable();
    this.authSvc.resetPassword(this.token, this.tokenID, this.form.controls.password.value)
    .pipe(untilComponentDestroyed(this))
    .subscribe(passwordResult => {
      this.shared.openSnackBar('Your password has been reset, please sign in.', 'message', 5000);
      this.showSpinner = false;

      setTimeout(function () {
        self.ActivateBackArrowSvc.setBackRoute('', 'forward');
        self.router.navigateByUrl('/signin');
      }, 2000);

    }, error => {
      this.showSpinner = false;
      if (error.status === 406) {
        this.httpError = true;
        this.httpErrorText = 'Token is not valid';
      } else {
        this.shared.notifyUserMajorError(error);
        throw new Error(JSON.stringify(error));
      }
    })
  }

  private listenForParameters() {
    this.routeSubscription = this.route
    .queryParams
    .pipe(untilComponentDestroyed(this))
    .subscribe(params => {
      if (params.e) {
        this.token = params.e;
        this.validateToken();
      }
    }, error => {
      this.sentry.logError('PasswordReset:listenForParameters: could not read parameters.  error=' + error);
    });
  }

  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image1.jpeg';
    } else {
      this.landingImage = 'landing-imageM1.jpeg';
    }
  }

  private validateToken() {
    this.authSvc.validatePasswordResetToken(this.token)
    .pipe(untilComponentDestroyed(this))
    .subscribe(tokenResult => {
      this.tokenID = tokenResult.tokenID;
    }, error => {
      if (error === 403) { // token expired
        this.httpError = true;
        this.httpErrorText = 'The reset token has expired. Please request to reset password again.';
      } else {
        this.httpError = true;
        this.httpErrorText = 'The reset token is invalid.  Please request your password to be reset again.';
      }
    });
  }
}
