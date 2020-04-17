import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { take } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { AuthenticationService } from '@services/data-services/authentication.service';

import { ItokenPayload } from '@services/data-services/authentication.service';
import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {
  credentials: ItokenPayload;
  form: FormGroup;
  httpError = false;
  httpErrorText = '';

  showSpinner = false;

  constructor(private authSvc: AuthenticationService,
              private shared: SharedComponent,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl({value: ''}, [Validators.required, Validators.email])
              },
                { updateOn: 'blur' }
              );
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
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.httpError = false;
    this.httpErrorText = '';
    this.authSvc.updateUsername(this.credentials)
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
      } else {
        console.log('CredentialsComponent:onSubmit: throw error ', error);
        throw new Error(error);
      }
    });
  }


  // Get username from database
  private getCredentials() {
    this.authSvc.getUsername()
    .pipe(take(1))
    .subscribe(credentials => {
      this.credentials = credentials;
      this.form.patchValue({
        username: this.credentials.email
      });
      this.showSpinner = false;
      this.form.enable();
    }, error => {
      this.showSpinner = false;
      console.error('CredentialsComponent:getCredentials: error getting user credentials ', error);
      throw new Error(error);
    });
  }
}
