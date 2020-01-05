import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../../../core/services/data.service';
import { ItokenPayload } from './../../../interfaces/tokenPayload';

@Component({
  selector: 'app-signin-dialog',
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

  constructor(private DataSvc: DataService,
              private dialogRef: MatDialogRef<SigninDialogComponent>,
              fb: FormBuilder) {
              this.form = fb.group({
                email: new FormControl('', [Validators.required, Validators.email]),
                password: new FormControl('', Validators.required)
              });
  }

  ngOnInit() {
  }

  submit() {
    this.credentials.email = this.form.controls.email.value;
    this.credentials.password = this.form.controls.password.value;

    this.DataSvc.login(this.credentials)
    .pipe(
      catchError (this.handleError)
    )
    .subscribe((responseData) => {
      console.log('login back=', responseData);
    });
    this.dialogRef.close(this.form.value);
  }

  private handleError(err: string) {
    console.log('Error adding user: ' + err);
    return throwError(err);
  }

  close() {
    console.log('close dialog');
    this.dialogRef.close();
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
