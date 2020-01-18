import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router} from '@angular/router';
// import { MatDialogRef } from '@angular/material/dialog';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { SigninButtonVisibleService } from './../../core/services/signin-btn-visibility.service';
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
    email: '',
    password: ''
  };
  showSpinner = false;

  constructor(private authSvc: AuthenticationService,
              private router: Router,
              private signinBtnVisibleSvc: SigninButtonVisibleService,
              // private dialogRef: MatDialogRef<SigninDialogComponent>,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: '', disabled: this.showSpinner}, [Validators.required, Validators.email]),
                password: new FormControl({value: '', disabled: this.showSpinner}, Validators.required)
              });
  }

  @Input() state: boolean;
  @Output() toggle = new EventEmitter<boolean>();

  ngOnInit() {
    this.signinBtnVisibleSvc.toggleSigninButtonVisible(false);
  }

  onSubmit() {
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;

    console.log('about to call login', this.credentials);
    this.showSpinner = true;
/*     const source = timer(5000);
    const subscribe = source.subscribe(val => { */
    this.authSvc.login(this.credentials)
    .pipe(
      catchError (this.handleError)
    )
    .subscribe ((responseData) => {
      console.log('logged in');
      this.showSpinner = false;
      this.router.navigateByUrl('/home');
    });
    // });
  }

  private handleError(error) {
    let errorMessage = '';
    this.showSpinner = false;
    if (error.error instanceof ErrorEvent) {
        // client-side error
        errorMessage = `Error: ${error.error.message}`;
    } else {
        // server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  onClose() {
    // this.dialogRef.close();
    this.toggle.emit(!this.state);
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
