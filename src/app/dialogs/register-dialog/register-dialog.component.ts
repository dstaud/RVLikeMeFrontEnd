import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './../../core/services/data-services/authentication.service';
import { ItokenPayload } from './../../interfaces/tokenPayload';
import { SharedComponent } from './../../shared/shared.component';

@Component({
  selector: 'app-rvlm-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss'],
  providers: [AuthenticationService]
})
export class RegisterDialogComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  showSpinner = false;
  credentials: ItokenPayload = {
    email: '',
    firstName: '',
    password: ''
  };

  constructor(private authSvc: AuthenticationService,
              private dialogRef: MatDialogRef<RegisterDialogComponent>,
              private shared: SharedComponent,
              fb: FormBuilder) {
              this.form = fb.group({
                firstName: new FormControl('', Validators.required),
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required),
                passwordConfirm: new FormControl('', Validators.required)
              });
}

  ngOnInit() {
  }

  onSubmit() {
    this.credentials.email = this.form.controls.email.value;
    this.credentials.email = this.credentials.email.toLowerCase();
    this.credentials.password = this.form.controls.password.value;
    this.credentials.firstName = this.form.controls.firstName.value;

    this.showSpinner = true;
    this.authSvc.registerUser(this.credentials)
    .pipe(
      catchError (this.authSvc.handleBackendError)
    )
    .subscribe((responseData) => {
      this.showSpinner = false;
      if (responseData.status === 201) {
        this.shared.openSnackBar('Email "' + this.form.controls.email.value + '" already exists', 'error');
      } else {
        this.shared.openSnackBar('Credentials saved successfully', 'message');
        this.onClose();
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
