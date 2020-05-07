import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '@services/data-services/authentication.service';

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
  hidePassword: boolean = false;
  showSpinner: boolean = false;

  private windowWidth: number;
  private routeSubscription: any;
  private token: string;

  private regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private route: ActivatedRoute,
              private authSvc: AuthenticationService,
              fb: FormBuilder) {
              this.form = fb.group({
                password: new FormControl('', [Validators.required, Validators.pattern(this.regPassword)])
              });
}

  ngOnInit(): void {
    console.log('PasswordReset:ngOnInit:');
    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  // Form validation error handling
  errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

  onSubmit() {
    this.authSvc.resetPassword(this.token, this.form.controls.password.value)
    .subscribe(passwordResult => {
      console.log('PasswordReset:onSubmit: passwordResult=', passwordResult);
    }, error => {
      console.error('PasswordReset:onSubmit: error resetting password=', error);
      if (error.status === 409) {

      }
      throw new Error(error);
    })
  }

  private listenForParameters() {
    console.log('PasswordReset:listenForParameters:');
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      if (params.e) {
        this.token = params.e;
        console.log('PasswordReset:listenForParameters: token=', this.token);
        this.validateToken();
      }
    }, error => {
      console.error('PasswordReset:listenForParameters: could not read parameters.  error=', error);
      throw new Error(error);
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
    .subscribe(tokenResult => {
      console.log('PasswordReset:validateToken: tokenResult=', tokenResult);
    }, error => {
      console.error('PasswordReset:validateToken: error validating token.  error=', error);
      if (error === 403) { // token expired
        this.httpError = true;
        this.httpErrorText = 'The reset token has expired. Please request to reset password again.';
      } else {
        this.httpError = true;
        this.httpErrorText = 'The reset token is invalid.';
      }
    })
  }
}