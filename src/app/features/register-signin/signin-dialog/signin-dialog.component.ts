import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './../../../core/services/data-services/authentication.service';
import { ItokenPayload } from './../../../interfaces/tokenPayload';

@Component({
  selector: 'app-rvlm-signin-dialog',
  templateUrl: './signin-dialog.component.html',
  styleUrls: ['./signin-dialog.component.scss']
})
export class SigninDialogComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  credentials: ItokenPayload = {
    email: '',
    password: ''
  };

  constructor(private authSvc: AuthenticationService,
              private dialogRef: MatDialogRef<SigninDialogComponent>,
              fb: FormBuilder) {
              this.form = fb.group({
                username: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required)
              });
  }

  ngOnInit() {
  }

  onSubmit() {
    this.credentials.email = this.form.controls.username.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;

    console.log('about to call login', this.credentials);
    this.authSvc.login(this.credentials)
    .pipe(
      catchError (this.handleError)
    )
    .subscribe ((responseData) => {
      console.log('logged in');
      this.dialogRef.close(this.form.value);
    });
  }

  private handleError(error) {
    let errorMessage = '';
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
    this.dialogRef.close();
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
