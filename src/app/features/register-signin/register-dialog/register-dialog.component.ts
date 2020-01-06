import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../../../core/services/data.service';
import { ItokenPayload } from './../../../interfaces/tokenPayload';

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss'],
  providers: [DataService]
})
export class RegisterDialogComponent implements OnInit {
  form: FormGroup;
  hidePassword = true;
  credentials: ItokenPayload = {
    email: '',
    firstName: '',
    password: ''
  };

  constructor(private DataSvc: DataService,
              private dialogRef: MatDialogRef<RegisterDialogComponent>,
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

  submit() {
    this.credentials.email = this.form.controls.email.value;
    this.credentials.password = this.form.controls.password.value;
    this.credentials.firstName = this.form.controls.firstName.value;

    this.DataSvc.registerUser(this.credentials)
    .pipe(
      catchError (this.DataSvc.handleBackendError)
    )
    .subscribe((responseData) => {
      if (responseData.status === 201) {
        alert('Email "' + this.form.controls.email.value + '" already exists');
      } else {
        alert('credentials saved');
        this.close();
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
