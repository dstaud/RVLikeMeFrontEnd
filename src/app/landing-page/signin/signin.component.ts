import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';
// import { timer } from 'rxjs';

@Component({
  selector: 'app-rvlm-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  credentials: ItokenPayload = {
    _id: '',
    email: '',
    password: '',
    tokenExpire: 0
  };
  showSpinner = false;
  httpError = false;
  httpErrorText = 'No Error';
  returnRoute = '';

  constructor(private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: '', disabled: this.showSpinner},
                                          [Validators.required, Validators.email]),
                password: new FormControl({value: '', disabled: this.showSpinner},
                                           Validators.required)
              });
  }

  @Input() state: boolean;
  @Output() toggle = new EventEmitter<boolean>();

  ngOnInit() {
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
    console.log('in Signin Init');
    this.activateBackArrowSvc.route$
    .subscribe(data => {
      this.returnRoute = data.valueOf();
      if (this.returnRoute) {
        if (this.returnRoute.substring(0, 1) === '*') {
            this.returnRoute = this.returnRoute.substring(1, this.returnRoute.length);
            console.log('auto route=', this.returnRoute);
        }
      }
    });
  }

  onSubmit() {
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    this.httpError = false;
    this.httpErrorText = '';
    console.log('about to call login', this.credentials);
    this.showSpinner = true;
/*     const source = timer(5000);
    const subscribe = source.subscribe(val => { */
    this.authSvc.login(this.credentials)
    .subscribe ((responseData) => {
      console.log('logged in');
      this.showSpinner = false;
      this.authSvc.setUserToAuthorized(true);
      console.log('is there an auto route ', this.returnRoute);
      if (this.returnRoute && this.returnRoute !== 'landing-page') {
        // User booked-marked a specific page which can route too after authorization
        this.router.navigateByUrl(this.returnRoute);
        this.activateBackArrowSvc.setBackRoute('');
      } else {
        // After user authorizied to to home page
        this.router.navigateByUrl('/home');
        this.activateBackArrowSvc.setBackRoute('');
      }
    }, error => {
      this.showSpinner = false;
      this.authSvc.setUserToAuthorized(false);
      console.log('in error!', error);
      this.httpError = true;
      if (error.status === 401) {
        this.httpErrorText = 'Invalid email address or password';
      } else {
        this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
      }
    });
    // });
  }

  onClose() {
    this.toggle.emit(!this.state);
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
